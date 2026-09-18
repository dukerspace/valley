import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { main } from '../src/cli.ts'
import { PACKAGE_ROOT } from '../src/paths.ts'
import { getVersion, printVersion } from '../src/version.ts'

describe('version', () => {
  test('getVersion matches package.json', () => {
    const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')) as {
      version: string
    }
    expect(getVersion()).toBe(pkg.version)
  })

  test('printVersion writes the version string', () => {
    const lines: string[] = []
    printVersion((...args) => {
      lines.push(args.map(String).join(' '))
    })
    expect(lines).toEqual([getVersion()])
  })

  test('main --version and -v print version and exit 0', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }
    try {
      expect(await main(['--version'])).toBe(0)
      expect(await main(['-v'])).toBe(0)
    } finally {
      console.log = originalLog
    }
    expect(logs).toEqual([getVersion(), getVersion()])
  })
})
