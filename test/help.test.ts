import { describe, expect, test } from 'bun:test'
import { HELP, printHelp } from '../src/help.ts'

describe('help', () => {
  test('HELP includes usage and version flag', () => {
    expect(HELP).toContain('npx valley-cli new <name> [options]')
    expect(HELP).toContain('bunx valley-cli new <name> [options]')
    expect(HELP).toContain('bun run valley -- new <name> [options]')
    expect(HELP).toContain('new <name>')
    expect(HELP).toContain('add <pkg...>')
    expect(HELP).toContain('valley add ai')
    expect(HELP).toContain('-v, --version')
    expect(HELP).toContain('-h, --help')
    expect(HELP).toContain('--packages')
    expect(HELP).toContain('ai, stripe, email, storage')
  })

  test('printHelp writes HELP to the given out', () => {
    const lines: string[] = []
    printHelp((...args) => {
      lines.push(args.map(String).join(' '))
    })
    expect(lines.join('\n')).toContain(HELP.trim())
  })
})
