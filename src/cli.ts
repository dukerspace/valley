import { createProject } from './create.ts'
import { printHelp } from './help.ts'
import { printVersion } from './version.ts'

const KNOWN_FLAGS = new Set([
  '--help',
  '-h',
  '--version',
  '-v',
  '--no-install',
  '--no-git',
  '--dry-run',
])

export async function main(argv: string[] = process.argv.slice(2), cwd = process.cwd()): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp()
    return 0
  }

  if (argv.includes('--version') || argv.includes('-v')) {
    printVersion()
    return 0
  }

  const unknown = argv.filter((a) => a.startsWith('-') && !KNOWN_FLAGS.has(a))
  if (unknown.length > 0) {
    console.error(`[create-valley] Unknown option: ${unknown[0]}`)
    printHelp(console.error)
    return 1
  }

  const noInstall = argv.includes('--no-install')
  const noGit = argv.includes('--no-git')
  const dryRun = argv.includes('--dry-run')
  const positional = argv.filter((a) => !a.startsWith('-'))
  const name = positional[0]

  if (!name) {
    printHelp()
    return 0
  }

  try {
    await createProject({ name, cwd, noInstall, noGit, dryRun })
    return 0
  } catch (err) {
    console.error(`[create-valley] ${err instanceof Error ? err.message : String(err)}`)
    return 1
  }
}
