import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { hasBun } from './helpers/bun.ts'
import { renameProject, TEMPLATE_SCOPE } from './helpers/rename.ts'
import { copySharedPackage } from './helpers/template.ts'
import {
  appendEnvExampleSections,
  linkPackagesIntoApi,
  type OptionalPackage,
} from './packages.ts'
import { SHARED_PACKAGES_ROOT, TEMPLATE_ROOT } from './paths.ts'

export type AddPackagesOptions = {
  cwd?: string
  packages: readonly OptionalPackage[]
  packagesRoot?: string
  /** Full template .env.example used as the source of optional sections. */
  envExampleSource?: string
  noInstall?: boolean
  dryRun?: boolean
}

export type AddPackagesResult = {
  root: string
  scope: string
  added: OptionalPackage[]
  linked: string[]
  copied: string[]
}

function detectProjectScope(root: string): string {
  const pkgPath = join(root, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: unknown }
  if (typeof pkg.name !== 'string' || !pkg.name.trim()) {
    throw new Error(`Project package.json at ${pkgPath} is missing a name`)
  }
  const name = pkg.name.trim()
  if (name.startsWith('@')) {
    const scope = name.slice(1).split('/')[0]
    if (!scope) throw new Error(`Could not detect project scope from package name "${name}"`)
    return scope
  }
  return name
}

function assertValleyProject(root: string): void {
  if (!existsSync(join(root, 'package.json'))) {
    throw new Error(`Not a valley project: missing package.json in ${root}`)
  }
  if (!existsSync(join(root, 'apps', 'api', 'package.json'))) {
    throw new Error(`Not a valley project: missing apps/api/package.json in ${root}`)
  }
  if (!existsSync(join(root, 'packages'))) {
    throw new Error(`Not a valley project: missing packages/ in ${root}`)
  }
}

export async function addPackages(options: AddPackagesOptions): Promise<AddPackagesResult> {
  const {
    cwd = process.cwd(),
    packages: selected,
    packagesRoot = SHARED_PACKAGES_ROOT,
    envExampleSource = join(TEMPLATE_ROOT, '.env.example'),
    noInstall = false,
    dryRun = false,
  } = options

  const root = resolve(cwd)
  assertValleyProject(root)

  if (selected.length === 0) {
    throw new Error('No packages to add. Pass package ids (e.g. ai, stripe) or use the interactive picker.')
  }

  if (!existsSync(packagesRoot)) {
    throw new Error(`Shared packages not found at ${packagesRoot}`)
  }

  if (!existsSync(envExampleSource)) {
    throw new Error(`Template .env.example not found at ${envExampleSource}`)
  }

  for (const id of selected) {
    const dest = join(root, 'packages', id)
    if (existsSync(dest)) {
      throw new Error(`Package already exists: packages/${id}`)
    }
    if (!existsSync(join(packagesRoot, id))) {
      throw new Error(`Shared package not found at ${join(packagesRoot, id)}`)
    }
  }

  if (!dryRun && !noInstall && !hasBun()) {
    throw new Error('Bun is required to run bun install. Install Bun: https://bun.sh')
  }

  const scope = detectProjectScope(root)
  console.log(`[valley] Adding packages to ${root} (scope @${scope})…`)

  if (dryRun) {
    console.log(`[valley] Would add: ${selected.join(', ')}`)
    console.log(`[valley] Would link into apps/api: ${selected.join(', ')}`)
    if (scope !== TEMPLATE_SCOPE) {
      console.log(`[valley] Would rename @${TEMPLATE_SCOPE} → @${scope} in new packages`)
    }
    console.log(`[valley] Would append .env.example sections for: ${selected.join(', ')}`)
    if (!noInstall) console.log('[valley] Would run: bun install')
    return { root, scope, added: [...selected], linked: [...selected], copied: [] }
  }

  const copied: string[] = []
  for (const id of selected) {
    const files = copySharedPackage(packagesRoot, root, id)
    copied.push(...files)
    const renamed = renameProject({ rootDir: join(root, 'packages', id), name: scope })
    if (renamed.changed.length > 0) {
      console.log(`[valley] Renamed @${TEMPLATE_SCOPE} → @${scope} in packages/${id} (${renamed.changed.length} file(s)).`)
    }
  }
  console.log(`[valley] Copied ${copied.length} file(s) for: ${selected.join(', ')}`)

  const linked = linkPackagesIntoApi(root, selected, { scope })
  if (linked.length > 0) {
    console.log(`[valley] Linked into apps/api: ${linked.join(', ')}`)
  }

  const envPath = join(root, '.env.example')
  if (existsSync(envPath)) {
    const fullTemplateEnv = readFileSync(envExampleSource, 'utf8')
    const next = appendEnvExampleSections(
      readFileSync(envPath, 'utf8'),
      selected,
      fullTemplateEnv
    )
    writeFileSync(envPath, next)
    console.log(`[valley] Updated .env.example for: ${selected.join(', ')}`)
  } else {
    console.warn('[valley] No .env.example found; skipped env updates.')
  }

  if (!noInstall) {
    console.log('[valley] Running bun install…')
    const install = spawnSync('bun', ['install'], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'inherit',
    })
    if (install.status !== 0) {
      throw new Error(`bun install failed with exit code ${install.status ?? 1}`)
    }
  }

  console.log(`[valley] Done. Added: ${selected.join(', ')}`)
  if (noInstall) console.log('  bun install')
  console.log('  Review .env.example (and .env) for new optional vars')

  return { root, scope, added: [...selected], linked, copied }
}
