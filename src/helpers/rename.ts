import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { isValidProjectName } from './name.ts'

export const TEMPLATE_SCOPE = 'valley'

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
    .replaceAll(`${TEMPLATE_SCOPE}_admin_access_token`, `${name}_admin_access_token`)
    .replaceAll(`${TEMPLATE_SCOPE}_admin_refresh_token`, `${name}_admin_refresh_token`)
    .replaceAll(`${TEMPLATE_SCOPE}_access_token`, `${name}_access_token`)
    .replaceAll(`${TEMPLATE_SCOPE}_refresh_token`, `${name}_refresh_token`)
    .replaceAll(`${TEMPLATE_SCOPE}_locale`, `${name}_locale`)
    .replaceAll(`localhost:5432/${TEMPLATE_SCOPE}`, `localhost:5432/${name}`)
    .replaceAll('Valley Health', `${title} Health`)
    .replaceAll('Valley Backoffice', `${title} Backoffice`)
    .replaceAll('สถานะ Valley', `สถานะ ${title}`)
}

function shouldProcessFile(filePath: string): boolean {
  const base = filePath.split(/[/\\]/).pop() ?? ''
  if (base === 'bun.lock' || base === 'package-lock.json' || base === 'yarn.lock') {
    return false
  }
  if (base.startsWith('.') && base.includes('env') && !base.endsWith('.example')) {
    if (base === '.env' || /^\.env\./.test(base)) return false
  }
  const ext = base.includes('.') ? `.${base.split('.').pop()}` : ''
  if (TEXT_EXTENSIONS.has(ext)) return true
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

export function renameProject(options: RenameOptions): { changed: string[]; name: string } {
  const { rootDir, dryRun = false } = options
  const name = options.name.trim().toLowerCase()

  if (!isValidProjectName(name)) {
    throw new Error(
      `Invalid project name "${options.name}". Use a lowercase npm slug (e.g. my-app).`
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
