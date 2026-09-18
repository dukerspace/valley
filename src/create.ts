import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { hasBun } from './helpers/bun.ts'
import { initGit } from './helpers/git.ts'
import { isValidProjectName } from './helpers/name.ts'
import { renameProject, TEMPLATE_SCOPE } from './helpers/rename.ts'
import { copyTemplate, stripScaffolding } from './helpers/template.ts'
import { TEMPLATE_ROOT } from './paths.ts'

export type CreateProjectOptions = {
  name: string
  cwd?: string
  sourceRoot?: string
  noInstall?: boolean
  noGit?: boolean
  dryRun?: boolean
}

export type CreateProjectResult = {
  destRoot: string
  copied: string[]
  name: string
}

export async function createProject(options: CreateProjectOptions): Promise<CreateProjectResult> {
  const {
    name: rawName,
    cwd = process.cwd(),
    sourceRoot = TEMPLATE_ROOT,
    noInstall = false,
    noGit = false,
    dryRun = false,
  } = options

  const name = rawName.trim().toLowerCase()
  if (!isValidProjectName(name)) {
    throw new Error(`Invalid project name "${rawName}". Use a lowercase npm slug (e.g. my-app).`)
  }

  if (!existsSync(sourceRoot) || !existsSync(join(sourceRoot, 'package.json'))) {
    throw new Error(
      `Template not found at ${sourceRoot}. Expected templates/${TEMPLATE_SCOPE} with a package.json.`
    )
  }

  const destRoot = resolve(cwd, name)
  if (existsSync(destRoot)) {
    throw new Error(`Directory already exists: ${destRoot}`)
  }

  if (!dryRun && !noInstall && !hasBun()) {
    throw new Error('Bun is required to run bun install. Install Bun: https://bun.sh')
  }

  console.log(`[create-valley] Creating ${name} from templates/${TEMPLATE_SCOPE}…`)
  const copied = copyTemplate(sourceRoot, destRoot, { dryRun })
  console.log(`[create-valley] Copied ${copied.length} file(s)${dryRun ? ' (dry run)' : ''}.`)

  if (dryRun) {
    if (name !== TEMPLATE_SCOPE) console.log(`[create-valley] Would rename @${TEMPLATE_SCOPE} → @${name}`)
    if (!noGit) console.log('[create-valley] Would run: git init')
    if (!noInstall) console.log('[create-valley] Would run: bun install')
    return { destRoot, copied, name }
  }

  stripScaffolding(destRoot)

  const renamed = renameProject({ rootDir: destRoot, name })
  if (renamed.changed.length > 0) {
    console.log(`[create-valley] Renamed @${TEMPLATE_SCOPE} → @${name} in ${renamed.changed.length} file(s).`)
  }

  if (!noGit) {
    if (!initGit(destRoot)) {
      console.warn('[create-valley] git init failed; continuing.')
    }
  }

  if (!noInstall) {
    console.log('[create-valley] Running bun install…')
    const install = spawnSync('bun', ['install'], {
      cwd: destRoot,
      encoding: 'utf8',
      stdio: 'inherit',
    })
    if (install.status !== 0) {
      throw new Error(`bun install failed with exit code ${install.status ?? 1}`)
    }
  }

  console.log(`[create-valley] Done. Next:`)
  console.log(`  cd ${name}`)
  if (noInstall) console.log('  bun install')
  console.log('  cp .env.example .env')
  console.log('  bun run dev')

  return { destRoot, copied, name }
}
