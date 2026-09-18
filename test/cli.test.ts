import { describe, expect, test } from 'bun:test'
import { main } from '../src/cli.ts'
import { HELP } from '../src/help.ts'

describe('cli help', () => {
  test('prints usage for --help, -h, and a bare invoke', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['--help'])).toBe(0)
      expect(await main(['-h'])).toBe(0)
      expect(await main([])).toBe(0)
    } finally {
      console.log = originalLog
    }

    expect(logs.join('\n')).toContain(HELP.trim())
    expect(logs[0]).toContain('npx create-valley <name> [options]')
  })

  test('rejects unknown options and prints help', async () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['--wat'])).toBe(1)
    } finally {
      console.error = originalError
    }

    expect(errors.join('\n')).toContain('Unknown option: --wat')
    expect(errors.join('\n')).toContain('npx create-valley <name> [options]')
  })
})
