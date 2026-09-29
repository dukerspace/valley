import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { TEMPLATE_SCOPE } from './helpers/rename.ts'

export const CORE_PACKAGES = ['database', 'shared', 'ui', 'locale'] as const
export const OPTIONAL_PACKAGES = ['ai', 'stripe', 'email', 'storage'] as const

export type CorePackage = (typeof CORE_PACKAGES)[number]
export type OptionalPackage = (typeof OPTIONAL_PACKAGES)[number]

export type OptionalPackageMeta = {
  id: OptionalPackage
  label: string
  /** Marker in .env.example: `# --- Optional: <id> ---` */
  envSection: string
}

export const OPTIONAL_PACKAGE_META: Record<OptionalPackage, OptionalPackageMeta> = {
  ai: { id: 'ai', label: 'AI (multi-provider)', envSection: 'ai' },
  stripe: { id: 'stripe', label: 'Stripe', envSection: 'stripe' },
  email: { id: 'email', label: 'Email (Resend)', envSection: 'email' },
  storage: { id: 'storage', label: 'Storage (S3)', envSection: 'storage' },
}

const OPTIONAL_SET = new Set<string>(OPTIONAL_PACKAGES)

export function isOptionalPackage(value: string): value is OptionalPackage {
  return OPTIONAL_SET.has(value)
}

export function parsePackagesFlag(raw: string): OptionalPackage[] {
  const parts = raw
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)

  if (parts.length === 0) {
    return []
  }

  const seen = new Set<OptionalPackage>()
  for (const part of parts) {
    if (!isOptionalPackage(part)) {
      throw new Error(
        `Unknown package "${part}". Valid: ${OPTIONAL_PACKAGES.join(', ')}`
      )
    }
    seen.add(part)
  }
  return OPTIONAL_PACKAGES.filter((id) => seen.has(id))
}

export type ApplyPackageSelectionResult = {
  removed: string[]
  linked: string[]
}

/**
 * Prune unselected optional packages, link selected ones into apps/api,
 * and strip unused optional blocks from .env.example.
 * Call before renameProject so scope stays @valley.
 */
export function applyPackageSelection(
  destRoot: string,
  selected: readonly OptionalPackage[],
  options: { dryRun?: boolean; scope?: string } = {}
): ApplyPackageSelectionResult {
  const { dryRun = false, scope = TEMPLATE_SCOPE } = options
  const selectedSet = new Set(selected)
  const removed: string[] = []
  const linked: string[] = []

  for (const id of OPTIONAL_PACKAGES) {
    if (selectedSet.has(id)) continue
    const dir = join(destRoot, 'packages', id)
    if (!existsSync(dir)) continue
    removed.push(id)
    if (!dryRun) {
      rmSync(dir, { recursive: true, force: true })
    }
  }

  linked.push(...linkPackagesIntoApi(destRoot, selected, { dryRun, scope }))

  const envPath = join(destRoot, '.env.example')
  if (existsSync(envPath) && !dryRun) {
    const next = pruneEnvExample(readFileSync(envPath, 'utf8'), selectedSet)
    writeFileSync(envPath, next)
  }

  return { removed, linked }
}

/** Link optional packages into apps/api dependencies as `@<scope>/<id>: "*"`. */
export function linkPackagesIntoApi(
  destRoot: string,
  ids: readonly OptionalPackage[],
  options: { dryRun?: boolean; scope?: string } = {}
): string[] {
  const { dryRun = false, scope = TEMPLATE_SCOPE } = options
  if (ids.length === 0) return []

  const apiPkgPath = join(destRoot, 'apps', 'api', 'package.json')
  if (!existsSync(apiPkgPath)) {
    if (dryRun) return [...ids]
    throw new Error(`apps/api/package.json not found at ${apiPkgPath}`)
  }

  if (dryRun) return [...ids]

  const pkg = JSON.parse(readFileSync(apiPkgPath, 'utf8')) as {
    dependencies?: Record<string, string>
  }
  pkg.dependencies ??= {}
  const linked: string[] = []
  for (const id of ids) {
    pkg.dependencies[`@${scope}/${id}`] = '*'
    linked.push(id)
  }
  writeFileSync(apiPkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  return linked
}

/** Remove `# --- Optional: <id> ---` sections that were not selected. */
export function pruneEnvExample(
  content: string,
  selected: ReadonlySet<OptionalPackage>
): string {
  const lines = content.split(/\r?\n/)
  const out: string[] = []
  let skipping: OptionalPackage | null = null

  const headerRe = /^# --- Optional: (\w+) ---$/

  for (const line of lines) {
    const match = line.match(headerRe)
    if (match) {
      const id = match[1] ?? ''
      if (isOptionalPackage(id) && !selected.has(id)) {
        skipping = id
        continue
      }
      skipping = null
      out.push(line)
      continue
    }

    if (skipping) {
      // End skip at next top-level section header or blank run before another section
      if (/^# --- /.test(line) && !/^# --- Optional:/.test(line)) {
        skipping = null
        out.push(line)
      }
      // else drop line (including blank lines inside optional block)
      continue
    }

    out.push(line)
  }

  // Trim trailing blank lines, keep single trailing newline
  while (out.length > 0 && out[out.length - 1] === '') {
    out.pop()
  }
  return `${out.join('\n')}\n`
}

/** Extract a single `# --- Optional: <id> ---` block (including trailing blank lines). */
export function extractEnvSection(
  content: string,
  id: OptionalPackage
): string | null {
  const lines = content.split(/\r?\n/)
  const headerRe = /^# --- Optional: (\w+) ---$/
  const start = lines.findIndex((line) => {
    const match = line.match(headerRe)
    return match?.[1] === id
  })
  if (start < 0) return null

  const block: string[] = [lines[start]!]
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]!
    if (/^# --- /.test(line)) break
    block.push(line)
  }

  while (block.length > 0 && block[block.length - 1] === '') {
    block.pop()
  }
  return block.join('\n')
}

/**
 * Append missing optional env sections from a full template `.env.example`.
 * Existing sections (by header) are left untouched.
 */
export function appendEnvExampleSections(
  content: string,
  ids: readonly OptionalPackage[],
  fullTemplateEnv: string
): string {
  if (ids.length === 0) return content.endsWith('\n') ? content : `${content}\n`

  const existing = new Set<OptionalPackage>()
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^# --- Optional: (\w+) ---$/)
    const id = match?.[1]
    if (id && isOptionalPackage(id)) existing.add(id)
  }

  const toAdd = ids.filter((id) => !existing.has(id))
  if (toAdd.length === 0) {
    return content.endsWith('\n') ? content : `${content}\n`
  }

  let next = content.replace(/\s*$/, '')
  for (const id of toAdd) {
    const section = extractEnvSection(fullTemplateEnv, id)
    if (!section) continue
    next = `${next}\n\n${section}`
  }
  return `${next}\n`
}
