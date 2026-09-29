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

  const apiPkgPath = join(destRoot, 'apps', 'api', 'package.json')
  if (existsSync(apiPkgPath) && selected.length > 0) {
    const raw = dryRun ? '' : readFileSync(apiPkgPath, 'utf8')
    if (!dryRun) {
      const pkg = JSON.parse(raw) as {
        dependencies?: Record<string, string>
      }
      pkg.dependencies ??= {}
      for (const id of selected) {
        const depName = `@${scope}/${id}`
        pkg.dependencies[depName] = '*'
        linked.push(id)
      }
      writeFileSync(apiPkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
    } else {
      for (const id of selected) linked.push(id)
    }
  } else if (selected.length > 0 && dryRun) {
    for (const id of selected) linked.push(id)
  }

  const envPath = join(destRoot, '.env.example')
  if (existsSync(envPath) && !dryRun) {
    const next = pruneEnvExample(readFileSync(envPath, 'utf8'), selectedSet)
    writeFileSync(envPath, next)
  }

  return { removed, linked }
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
