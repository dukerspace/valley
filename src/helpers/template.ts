import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'

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

/** CLI / scaffolder files that must not land in generated apps. */
export const SCAFFOLD_FILES = [
  'scripts/create-project.mjs',
  'scripts/create-project.test.ts',
  'scripts/rename-project.ts',
  'scripts/rename-project.test.ts',
  'src/index.ts',
  'src/cli.ts',
  'src/version.ts',
  'src/help.ts',
  'src/create.ts',
  'src/add.ts',
  'src/paths.ts',
  'src/helpers/name.ts',
  'src/helpers/template.ts',
  'src/helpers/rename.ts',
  'src/helpers/bun.ts',
  'src/helpers/git.ts',
  'test/version.test.ts',
  'test/help.test.ts',
  'test/cli.test.ts',
  'test/create.test.ts',
  'test/add.test.ts',
  'test/helpers/name.test.ts',
  'test/helpers/template.test.ts',
  'test/helpers/rename.test.ts',
]

export type CopyTemplateOptions = {
  dryRun?: boolean
}

export type StripScaffoldingOptions = {
  dryRun?: boolean
}

function shouldSkipEnvFile(entry: string): boolean {
  return entry === '.env' || (/^\.env\./.test(entry) && !entry.endsWith('.example'))
}

function walkAndCopy(
  sourceRoot: string,
  destRoot: string,
  opts: { dryRun: boolean; destRelPrefix?: string; skipTopLevel?: ReadonlySet<string> }
): string[] {
  const { dryRun, destRelPrefix = '', skipTopLevel } = opts
  const destName = destRoot.split(/[/\\]/).filter(Boolean).pop()
  const copied: string[] = []

  function walk(dir: string) {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue
      if (entry === '.valley-setup') continue
      // Avoid recursing into the destination when scaffolding inside the template tree.
      if (dir === sourceRoot && entry === destName) continue
      if (dir === sourceRoot && skipTopLevel?.has(entry)) continue

      const full = join(dir, entry)
      let st
      try {
        st = statSync(full)
      } catch {
        continue
      }

      const relFromSource = relative(sourceRoot, full)
      const rel = destRelPrefix
        ? join(destRelPrefix, relFromSource).replace(/\\/g, '/')
        : relFromSource.replace(/\\/g, '/')

      if (!destRelPrefix && SCAFFOLD_FILES.includes(rel)) continue

      if (st.isDirectory()) {
        walk(full)
        continue
      }
      if (!st.isFile()) continue

      if (shouldSkipEnvFile(entry)) continue

      copied.push(rel)
      if (!dryRun) {
        const target = join(destRoot, rel)
        mkdirSync(dirname(target), { recursive: true })
        cpSync(full, target)
      }
    }
  }

  if (!dryRun) {
    mkdirSync(destRoot, { recursive: true })
  }
  walk(sourceRoot)
  return copied
}

export function copyTemplate(
  sourceRoot: string,
  destRoot: string,
  opts: CopyTemplateOptions = {}
): string[] {
  const { dryRun = false } = opts
  // Packages and playbooks come from the CLI repo root; skip template copies/symlinks.
  return walkAndCopy(sourceRoot, destRoot, {
    dryRun,
    skipTopLevel: new Set(['packages', '.agents', '.skills', '.cursor']),
  })
}

export type CopySharedPackagesOptions = {
  dryRun?: boolean
}

/** Copy workspace packages from the CLI repo into destRoot/packages. */
export function copySharedPackages(
  packagesRoot: string,
  destRoot: string,
  opts: CopySharedPackagesOptions = {}
): string[] {
  const { dryRun = false } = opts
  if (!existsSync(packagesRoot)) {
    throw new Error(`Shared packages not found at ${packagesRoot}`)
  }
  return walkAndCopy(packagesRoot, destRoot, {
    dryRun,
    destRelPrefix: 'packages',
  })
}

export type CopySharedPackageOptions = {
  dryRun?: boolean
}

/** Copy a single workspace package into destRoot/packages/<id>. */
export function copySharedPackage(
  packagesRoot: string,
  destRoot: string,
  id: string,
  opts: CopySharedPackageOptions = {}
): string[] {
  const { dryRun = false } = opts
  const src = join(packagesRoot, id)
  if (!existsSync(src)) {
    throw new Error(`Shared package not found at ${src}`)
  }
  return walkAndCopy(src, destRoot, {
    dryRun,
    destRelPrefix: join('packages', id).replace(/\\/g, '/'),
  })
}

export type CopyCliPlaybooksOptions = {
  dryRun?: boolean
  /** Relative paths under playbooksRoot to copy (default: .agents, .skills, .cursor/rules). */
  paths?: readonly string[]
}

/** Copy agent/skill playbooks and cursor rules from the CLI repo into the new project. */
export function copyCliPlaybooks(
  playbooksRoot: string,
  destRoot: string,
  opts: CopyCliPlaybooksOptions = {}
): string[] {
  const { dryRun = false, paths = ['.agents', '.skills', '.cursor/rules'] } = opts
  const copied: string[] = []

  for (const rel of paths) {
    const src = join(playbooksRoot, rel)
    if (!existsSync(src)) {
      throw new Error(`CLI playbook path not found at ${src}`)
    }
    copied.push(
      ...walkAndCopy(src, destRoot, {
        dryRun,
        destRelPrefix: rel.replace(/\\/g, '/'),
      })
    )
  }

  return copied
}

/**
 * Strip scaffolding so the generated app is not itself an npx starter.
 */
export function stripScaffolding(destRoot: string, opts: StripScaffoldingOptions = {}): void {
  const { dryRun = false } = opts
  const pkgPath = join(destRoot, 'package.json')
  if (!existsSync(pkgPath)) return

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
    bin?: unknown
    scripts?: Record<string, string>
  }
  let changed = false
  if (pkg.bin !== undefined) {
    delete pkg.bin
    changed = true
  }
  if (pkg.scripts?.postinstall) {
    delete pkg.scripts.postinstall
    changed = true
  }
  if (pkg.scripts?.create) {
    delete pkg.scripts.create
    changed = true
  }
  if (pkg.scripts?.rename) {
    delete pkg.scripts.rename
    changed = true
  }
  if (changed && !dryRun) {
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
  }

  for (const rel of SCAFFOLD_FILES) {
    const full = join(destRoot, rel)
    if (existsSync(full) && !dryRun) {
      rmSync(full, { force: true })
    }
  }
}
