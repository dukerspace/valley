import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { addPackages } from './add.ts'
import { createProject } from './create.ts'
import { promptOptionalPackages } from './helpers/prompt-packages.ts'
import { printHelp } from './help.ts'
import { parsePackagesFlag, OPTIONAL_PACKAGES, type OptionalPackage } from './packages.ts'
import { printVersion } from './version.ts'

const LOG_PREFIX = '[valley]'

const KNOWN_FLAGS = new Set([
  '--help',
  '-h',
  '--version',
  '-v',
  '--no-install',
  '--no-git',
  '--dry-run',
  '--packages',
])

function parseArgv(argv: string[]): {
  flags: Set<string>
  packagesRaw: string | undefined
  positional: string[]
  unknown: string[]
} {
  const flags = new Set<string>()
  const positional: string[] = []
  const unknown: string[] = []
  let packagesRaw: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--packages') {
      const next = argv[i + 1]
      if (!next || next.startsWith('-')) {
        throw new Error('--packages requires a comma-separated list (e.g. ai,stripe)')
      }
      packagesRaw = next
      i++
      continue
    }
    if (arg.startsWith('--packages=')) {
      packagesRaw = arg.slice('--packages='.length)
      continue
    }
    if (arg.startsWith('-')) {
      if (!KNOWN_FLAGS.has(arg)) unknown.push(arg)
      else flags.add(arg)
      continue
    }
    positional.push(arg)
  }

  return { flags, packagesRaw, positional, unknown }
}

function installedOptionalPackages(cwd: string): Set<string> {
  const installed = new Set<string>()
  for (const id of OPTIONAL_PACKAGES) {
    if (existsSync(join(cwd, 'packages', id))) installed.add(id)
  }
  return installed
}

async function runNew(
  parsed: ReturnType<typeof parseArgv>,
  cwd: string
): Promise<number> {
  const [, name, ...extra] = parsed.positional

  if (!name) {
    console.error(`${LOG_PREFIX} Missing project name. Usage: valley new <name>`)
    printHelp(console.error)
    return 1
  }

  if (extra.length > 0) {
    console.error(`${LOG_PREFIX} Unexpected argument: ${extra[0]}`)
    printHelp(console.error)
    return 1
  }

  const noInstall = parsed.flags.has('--no-install')
  const noGit = parsed.flags.has('--no-git')
  const dryRun = parsed.flags.has('--dry-run')

  let packages: OptionalPackage[] = []
  if (parsed.packagesRaw !== undefined) {
    try {
      packages = parsePackagesFlag(parsed.packagesRaw)
    } catch (err) {
      console.error(`${LOG_PREFIX} ${err instanceof Error ? err.message : String(err)}`)
      return 1
    }
  } else if (process.stdin.isTTY) {
    const selected = await promptOptionalPackages()
    if (selected === null) return 1
    packages = selected
  }

  try {
    await createProject({ name, cwd, noInstall, noGit, dryRun, packages })
    return 0
  } catch (err) {
    console.error(`${LOG_PREFIX} ${err instanceof Error ? err.message : String(err)}`)
    return 1
  }
}

async function runAdd(
  parsed: ReturnType<typeof parseArgv>,
  cwd: string
): Promise<number> {
  if (parsed.flags.has('--no-git')) {
    console.error(`${LOG_PREFIX} --no-git is not supported for valley add`)
    return 1
  }
  if (parsed.packagesRaw !== undefined) {
    console.error(
      `${LOG_PREFIX} --packages is for valley new. Pass package ids as arguments: valley add ai stripe`
    )
    return 1
  }

  const [, ...pkgArgs] = parsed.positional
  const noInstall = parsed.flags.has('--no-install')
  const dryRun = parsed.flags.has('--dry-run')

  let packages: OptionalPackage[] = []
  if (pkgArgs.length > 0) {
    try {
      packages = parsePackagesFlag(pkgArgs.join(','))
    } catch (err) {
      console.error(`${LOG_PREFIX} ${err instanceof Error ? err.message : String(err)}`)
      return 1
    }
  } else if (process.stdin.isTTY) {
    const selected = await promptOptionalPackages({
      exclude: installedOptionalPackages(cwd),
      message: 'Select optional packages to add',
    })
    if (selected === null) return 1
    packages = selected
    if (packages.length === 0) return 0
  } else {
    console.error(
      `${LOG_PREFIX} Missing packages. Usage: valley add <pkg> [pkg...] (e.g. valley add ai stripe)`
    )
    return 1
  }

  try {
    await addPackages({ cwd, packages, noInstall, dryRun })
    return 0
  } catch (err) {
    console.error(`${LOG_PREFIX} ${err instanceof Error ? err.message : String(err)}`)
    return 1
  }
}

export async function main(argv: string[] = process.argv.slice(2), cwd = process.cwd()): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp()
    return 0
  }

  if (argv.includes('--version') || argv.includes('-v')) {
    printVersion()
    return 0
  }

  let parsed: ReturnType<typeof parseArgv>
  try {
    parsed = parseArgv(argv)
  } catch (err) {
    console.error(`${LOG_PREFIX} ${err instanceof Error ? err.message : String(err)}`)
    printHelp(console.error)
    return 1
  }

  if (parsed.unknown.length > 0) {
    console.error(`${LOG_PREFIX} Unknown option: ${parsed.unknown[0]}`)
    printHelp(console.error)
    return 1
  }

  const [command] = parsed.positional

  if (!command) {
    printHelp()
    return 0
  }

  if (command === 'new') return runNew(parsed, cwd)
  if (command === 'add') return runAdd(parsed, cwd)

  console.error(`${LOG_PREFIX} Unknown command: ${command}`)
  printHelp(console.error)
  return 1
}
