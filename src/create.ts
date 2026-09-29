import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { hasBun } from './helpers/bun.ts'
import { initGit } from './helpers/git.ts'
import { isValidProjectName } from './helpers/name.ts'
import { renameProject, TEMPLATE_SCOPE } from './helpers/rename.ts'
import { copyCliPlaybooks, copySharedPackages, copyTemplate, stripScaffolding } from './helpers/template.ts'
import {
  applyPackageSelection,
  OPTIONAL_PACKAGES,
  type OptionalPackage,
} from './packages.ts'
import { CLI_PLAYBOOK_PATHS, PACKAGE_ROOT, SHARED_PACKAGES_ROOT, TEMPLATE_ROOT } from './paths.ts'

export type CreateProjectOptions = {
  name: string
  cwd?: string
  sourceRoot?: string
  /** Shared packages source (default: repo-root packages/). */
  packagesRoot?: string
  /** CLI playbooks root (default: PACKAGE_ROOT). */
  playbooksRoot?: string
  noInstall?: boolean
  noGit?: boolean
  dryRun?: boolean
  /** Optional packages to keep and link into apps/api. Default: none. */
  packages?: readonly OptionalPackage[]
}

export type CreateProjectResult = {
  destRoot: string
  copied: string[]
  name: string
  packages: OptionalPackage[]
}

export async function createProject(options: CreateProjectOptions): Promise<CreateProjectResult> {
  const {
    name: rawName,
    cwd = process.cwd(),
    sourceRoot = TEMPLATE_ROOT,
    packagesRoot = SHARED_PACKAGES_ROOT,
    playbooksRoot = PACKAGE_ROOT,
    noInstall = false,
    noGit = false,
    dryRun = false,
    packages: selectedPackages = [],
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

  if (!existsSync(packagesRoot)) {
    throw new Error(`Shared packages not found at ${packagesRoot}`)
  }

  for (const rel of CLI_PLAYBOOK_PATHS) {
    if (!existsSync(join(playbooksRoot, rel))) {
      throw new Error(`CLI playbook path not found at ${join(playbooksRoot, rel)}`)
    }
  }

  const destRoot = resolve(cwd, name)
  if (existsSync(destRoot)) {
    throw new Error(`Directory already exists: ${destRoot}`)
  }

  if (!dryRun && !noInstall && !hasBun()) {
    throw new Error('Bun is required to run bun install. Install Bun: https://bun.sh')
  }

  const packages = [...selectedPackages]

  console.log(`[valley] Creating ${name} from templates/${TEMPLATE_SCOPE}…`)
  const templateCopied = copyTemplate(sourceRoot, destRoot, { dryRun })
  const packagesCopied = copySharedPackages(packagesRoot, destRoot, { dryRun })
  const playbooksCopied = copyCliPlaybooks(playbooksRoot, destRoot, {
    dryRun,
    paths: CLI_PLAYBOOK_PATHS,
  })
  const copied = [...templateCopied, ...packagesCopied, ...playbooksCopied]
  console.log(`[valley] Copied ${copied.length} file(s)${dryRun ? ' (dry run)' : ''}.`)

  if (packages.length > 0) {
    console.log(`[valley] Optional packages: ${packages.join(', ')}`)
  } else {
    console.log('[valley] Optional packages: (none)')
  }

  if (dryRun) {
    const wouldRemove = OPTIONAL_PACKAGES.filter((id) => !packages.includes(id))
    if (wouldRemove.length > 0) {
      console.log(`[valley] Would remove packages: ${wouldRemove.join(', ')}`)
    }
    if (packages.length > 0) {
      console.log(`[valley] Would link into apps/api: ${packages.join(', ')}`)
    }
    if (name !== TEMPLATE_SCOPE) console.log(`[valley] Would rename @${TEMPLATE_SCOPE} → @${name}`)
    if (!noGit) console.log('[valley] Would run: git init')
    if (!noInstall) console.log('[valley] Would run: bun install')
    return { destRoot, copied, name, packages }
  }

  stripScaffolding(destRoot)

  const selection = applyPackageSelection(destRoot, packages)
  if (selection.removed.length > 0) {
    console.log(`[valley] Removed unused packages: ${selection.removed.join(', ')}`)
  }
  if (selection.linked.length > 0) {
    console.log(`[valley] Linked into apps/api: ${selection.linked.join(', ')}`)
  }

  const renamed = renameProject({ rootDir: destRoot, name })
  if (renamed.changed.length > 0) {
    console.log(`[valley] Renamed @${TEMPLATE_SCOPE} → @${name} in ${renamed.changed.length} file(s).`)
  }

  if (!noGit) {
    if (!initGit(destRoot)) {
      console.warn('[valley] git init failed; continuing.')
    }
  }

  if (!noInstall) {
    console.log('[valley] Running bun install…')
    const install = spawnSync('bun', ['install'], {
      cwd: destRoot,
      encoding: 'utf8',
      stdio: 'inherit',
    })
    if (install.status !== 0) {
      throw new Error(`bun install failed with exit code ${install.status ?? 1}`)
    }
  }

  console.log(`[valley] Done. Next:`)
  console.log(`  cd ${name}`)
  if (noInstall) console.log('  bun install')
  console.log('  cp .env.example .env')
  console.log('  bun run dev')

  return { destRoot, copied, name, packages }
}
