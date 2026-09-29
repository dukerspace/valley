import { createProject } from './create.ts'
import { promptOptionalPackages } from './helpers/prompt-packages.ts'
import { printHelp } from './help.ts'
import { parsePackagesFlag, type OptionalPackage } from './packages.ts'
import { printVersion } from './version.ts'

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
    console.error(`[create-valley] ${err instanceof Error ? err.message : String(err)}`)
    printHelp(console.error)
    return 1
  }

  if (parsed.unknown.length > 0) {
    console.error(`[create-valley] Unknown option: ${parsed.unknown[0]}`)
    printHelp(console.error)
    return 1
  }

  const noInstall = parsed.flags.has('--no-install')
  const noGit = parsed.flags.has('--no-git')
  const dryRun = parsed.flags.has('--dry-run')
  const name = parsed.positional[0]

  if (!name) {
    printHelp()
    return 0
  }

  let packages: OptionalPackage[] = []
  if (parsed.packagesRaw !== undefined) {
    try {
      packages = parsePackagesFlag(parsed.packagesRaw)
    } catch (err) {
      console.error(`[create-valley] ${err instanceof Error ? err.message : String(err)}`)
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
    console.error(`[create-valley] ${err instanceof Error ? err.message : String(err)}`)
    return 1
  }
}
