#!/usr/bin/env bun
/**
 * Rename this starter template to a new project name.
 *
 * Usage:
 *   bun run rename rezerch
 *   bun run scripts/rename-project.ts --prompt   # interactive (postinstall)
 *
 * Skips when CI=1, SKIP_STARTER_RENAME=1, non-TTY (prompt mode), already renamed,
 * or .starter-setup exists.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const TEMPLATE_SCOPE = 'starter'
const TEMPLATE_ROOT_NAME = `@${TEMPLATE_SCOPE}`
const SETUP_MARKER = '.starter-setup'
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.output',
  '.nitro',
  '.turbo',
  '.cache',
  'coverage',
  'generated',
  '.vinxi',
  '.tanstack',
  '.react-router',
  'tmp',
  'temp',
  '.tmp',
  '.temp',
])

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.css',
  '.html',
  '.yml',
  '.yaml',
  '.toml',
  '.env',
  '.example',
  '.txt',
  '.prisma',
])

export type RenameOptions = {
  rootDir: string
  name: string
  dryRun?: boolean
}

export function isValidProjectName(name: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(name) && name.length <= 214
}

export function titleCaseName(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function applyReplacements(content: string, name: string): string {
  const title = titleCaseName(name)
  return content
    .replaceAll(`@${TEMPLATE_SCOPE}`, `@${name}`)
    .replaceAll(`${TEMPLATE_SCOPE}.locale`, `${name}.locale`)
    .replaceAll(`localhost:5432/${TEMPLATE_SCOPE}`, `localhost:5432/${name}`)
    .replaceAll('Starter Health', `${title} Health`)
    .replaceAll('สถานะ Starter', `สถานะ ${title}`)
}

function shouldProcessFile(filePath: string): boolean {
  const base = filePath.split('/').pop() ?? ''
  if (base === 'bun.lock' || base === 'package-lock.json' || base === 'yarn.lock') {
    return false
  }
  if (base === SETUP_MARKER) return false
  // Keep the rename tooling intact so it can still document/skip as a template.
  if (base === 'rename-project.ts' || base === 'rename-project.test.ts') {
    return false
  }
  if (base.startsWith('.') && base.includes('env') && !base.endsWith('.example')) {
    // Allow .env.example; skip local .env
    if (base === '.env' || /^\.env\./.test(base)) return false
  }
  const ext = base.includes('.') ? `.${base.split('.').pop()}` : ''
  if (TEXT_EXTENSIONS.has(ext)) return true
  // extensionless config-ish names
  return ['Dockerfile', 'Makefile', 'LICENSE', 'Procfile'].includes(base)
}

function walkFiles(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      walkFiles(full, out)
    } else if (st.isFile() && shouldProcessFile(full)) {
      out.push(full)
    }
  }
  return out
}

export function readRootPackageName(rootDir: string): string | null {
  const pkgPath = join(rootDir, 'package.json')
  if (!existsSync(pkgPath)) return null
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string }
    return pkg.name ?? null
  } catch {
    return null
  }
}

export function shouldSkipRename(rootDir: string, opts?: { force?: boolean }): string | null {
  if (opts?.force) return null
  if (process.env.SKIP_STARTER_RENAME === '1') return 'SKIP_STARTER_RENAME=1'
  if (process.env.STARTER_RENAME_RUNNING === '1') return 'rename already running'
  if (existsSync(join(rootDir, SETUP_MARKER))) return `${SETUP_MARKER} exists`
  const rootName = readRootPackageName(rootDir)
  if (rootName && rootName !== TEMPLATE_ROOT_NAME) {
    return `root package is already "${rootName}"`
  }
  return null
}

export function renameProject(options: RenameOptions): { changed: string[]; name: string } {
  const { rootDir, dryRun = false } = options
  const name = options.name.trim().toLowerCase()

  if (!isValidProjectName(name)) {
    throw new Error(
      `Invalid project name "${options.name}". Use a lowercase npm slug (e.g. rezerch).`
    )
  }

  if (name === TEMPLATE_SCOPE) {
    return { changed: [], name }
  }

  const files = walkFiles(rootDir)
  const changed: string[] = []

  for (const file of files) {
    let content: string
    try {
      content = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    const next = applyReplacements(content, name)
    if (next === content) continue
    changed.push(relative(rootDir, file))
    if (!dryRun) {
      writeFileSync(file, next, 'utf8')
    }
  }

  return { changed, name }
}

export function writeSetupMarker(rootDir: string): void {
  writeFileSync(join(rootDir, SETUP_MARKER), `${new Date().toISOString()}\n`, 'utf8')
}

function defaultNameFromCwd(rootDir: string): string {
  const base = rootDir.split(/[/\\]/).filter(Boolean).pop() ?? TEMPLATE_SCOPE
  return isValidProjectName(base) ? base : TEMPLATE_SCOPE
}

async function promptForName(defaultName: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise<string>((resolveAnswer) => {
    rl.question(`Project name [${defaultName}]: `, (value) => {
      rl.close()
      resolveAnswer(value.trim())
    })
  })
  return answer || defaultName
}

function printHelp(): void {
  console.log(`Rename the starter template packages to a new project name.

Usage:
  bun run rename <name>
  bun run scripts/rename-project.ts --prompt

Options:
  --prompt   Interactive prompt (used by postinstall)
  --dry-run  Show files that would change without writing
  --force    Run even if .starter-setup exists / already renamed
  --help     Show this help

Environment:
  SKIP_STARTER_RENAME=1   Skip postinstall prompt
  CI=1                    Skip postinstall prompt
`)
}

export async function main(argv = process.argv.slice(2), rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp()
    return 0
  }

  const prompt = argv.includes('--prompt')
  const dryRun = argv.includes('--dry-run')
  const force = argv.includes('--force')
  const positional = argv.filter((a) => !a.startsWith('-'))

  if (prompt) {
    if (process.env.CI === '1' || process.env.CI === 'true') {
      console.log('[rename] Skipping rename prompt (CI).')
      return 0
    }
    if (!process.stdin.isTTY) {
      console.log('[rename] Skipping rename prompt (non-interactive).')
      return 0
    }
    const skip = shouldSkipRename(rootDir)
    if (skip) {
      console.log(`[rename] Skipping: ${skip}`)
      return 0
    }

    const defaultName = defaultNameFromCwd(rootDir)
    const name = await promptForName(defaultName)

    if (name === TEMPLATE_SCOPE) {
      writeSetupMarker(rootDir)
      console.log('[rename] Keeping template name "@starter". Wrote .starter-setup.')
      return 0
    }

    if (!isValidProjectName(name)) {
      console.error(`[rename] Invalid name "${name}". Use a lowercase npm slug (e.g. rezerch).`)
      return 1
    }

    process.env.STARTER_RENAME_RUNNING = '1'
    const result = renameProject({ rootDir, name, dryRun })
    if (!dryRun) writeSetupMarker(rootDir)

    if (result.changed.length === 0) {
      console.log(`[rename] No files needed changes for "${name}".`)
    } else {
      console.log(`[rename] Renamed @starter → @${name} in ${result.changed.length} file(s).`)
      console.log('[rename] Run `bun install` again so workspace links update.')
    }
    return 0
  }

  const name = positional[0]
  if (!name) {
    printHelp()
    return 1
  }

  const skip = shouldSkipRename(rootDir, { force })
  if (skip && !force) {
    console.error(`[rename] Refusing to run: ${skip}. Use --force to override.`)
    return 1
  }

  if (name === TEMPLATE_SCOPE) {
    if (!dryRun) writeSetupMarker(rootDir)
    console.log('[rename] Name is still "starter"; nothing to rewrite.')
    return 0
  }

  process.env.STARTER_RENAME_RUNNING = '1'
  const result = renameProject({ rootDir, name, dryRun })
  if (!dryRun) writeSetupMarker(rootDir)

  if (dryRun) {
    console.log(`[rename] Dry run: would update ${result.changed.length} file(s):`)
    for (const f of result.changed) console.log(`  ${f}`)
    return 0
  }

  console.log(`[rename] Renamed @starter → @${result.name} in ${result.changed.length} file(s).`)
  if (result.changed.length > 0) {
    console.log('[rename] Run `bun install` again so workspace links update.')
  }
  return 0
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  main().then((code) => process.exit(code))
}
