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
    expect(logs[0]).toContain('npx valley-cli new <name> [options]')
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
    expect(errors.join('\n')).toContain('npx valley-cli new <name> [options]')
  })

  test('rejects unknown commands', async () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['create'])).toBe(1)
    } finally {
      console.error = originalError
    }

    expect(errors.join('\n')).toContain('Unknown command: create')
  })

  test('rejects new without a project name', async () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['new'])).toBe(1)
    } finally {
      console.error = originalError
    }

    expect(errors.join('\n')).toContain('Missing project name')
  })

  test('rejects unknown --packages values', async () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['new', 'demo', '--packages', 'foo'])).toBe(1)
    } finally {
      console.error = originalError
    }

    expect(errors.join('\n')).toContain('Unknown package "foo"')
  })

  test('rejects --packages without a value', async () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['new', 'demo', '--packages'])).toBe(1)
    } finally {
      console.error = originalError
    }

    expect(errors.join('\n')).toContain('--packages requires')
  })

  test('rejects add without packages in non-TTY', async () => {
    const errors: string[] = []
    const originalError = console.error
    const wasTTY = process.stdin.isTTY
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true })
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['add'])).toBe(1)
    } finally {
      console.error = originalError
      Object.defineProperty(process.stdin, 'isTTY', { value: wasTTY, configurable: true })
    }

    expect(errors.join('\n')).toContain('Missing packages')
  })

  test('rejects --no-git on add', async () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['add', 'ai', '--no-git'])).toBe(1)
    } finally {
      console.error = originalError
    }

    expect(errors.join('\n')).toContain('--no-git is not supported')
  })

  test('rejects unknown package on add', async () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['add', 'foo'])).toBe(1)
    } finally {
      console.error = originalError
    }

    expect(errors.join('\n')).toContain('Unknown package "foo"')
  })
})
