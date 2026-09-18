import { describe, expect, test } from 'bun:test'
import { HELP, printHelp } from '../src/help.ts'

describe('help', () => {
  test('HELP includes usage and version flag', () => {
    expect(HELP).toContain('npx create-valley <name> [options]')
    expect(HELP).toContain('bunx create-valley <name> [options]')
    expect(HELP).toContain('bun run create-valley <name> [options]')
    expect(HELP).toContain('-v, --version')
    expect(HELP).toContain('-h, --help')
  })

  test('printHelp writes HELP to the given out', () => {
    const lines: string[] = []
    printHelp((...args) => {
      lines.push(args.map(String).join(' '))
    })
    expect(lines.join('\n')).toContain(HELP.trim())
  })
})
