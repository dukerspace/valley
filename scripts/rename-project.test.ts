import { afterEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  applyReplacements,
  isValidProjectName,
  renameProject,
  titleCaseName,
} from './rename-project.ts'

const temps: string[] = []

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function makeFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'starter-rename-'))
  temps.push(dir)
  mkdirSync(join(dir, 'apps', 'api'), { recursive: true })
  mkdirSync(join(dir, 'packages', 'locale', 'src'), { recursive: true })

  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(
      {
        name: '@starter',
        private: true,
        scripts: {
          'db:generate': 'turbo run db:generate --filter=@starter/database',
        },
      },
      null,
      2
    )
  )
  writeFileSync(
    join(dir, 'apps', 'api', 'package.json'),
    JSON.stringify({ name: '@starter/api', dependencies: { '@starter/shared': 'workspace:*' } }, null, 2)
  )
  writeFileSync(
    join(dir, 'packages', 'locale', 'src', 'en.ts'),
    "export const en = { app: { title: 'Starter Health' } }\n"
  )
  writeFileSync(
    join(dir, 'packages', 'locale', 'src', 'th.ts'),
    "export const th = { app: { title: 'สถานะ Starter' } }\n"
  )
  writeFileSync(
    join(dir, 'apps', 'api', 'app.ts'),
    "const key = 'starter.locale'\nconst url = 'postgresql://postgres:postgres@localhost:5432/starter'\n"
  )
  // Should be skipped
  mkdirSync(join(dir, 'node_modules', '@starter'), { recursive: true })
  writeFileSync(join(dir, 'node_modules', '@starter', 'pkg.json'), '{"name":"@starter/skip"}\n')
  writeFileSync(join(dir, 'bun.lock'), 'workspace @starter/api\n')

  return dir
}

describe('isValidProjectName', () => {
  test('accepts lowercase npm slugs', () => {
    expect(isValidProjectName('rezerch')).toBe(true)
    expect(isValidProjectName('my-app')).toBe(true)
    expect(isValidProjectName('a')).toBe(true)
  })

  test('rejects invalid names', () => {
    expect(isValidProjectName('My App')).toBe(false)
    expect(isValidProjectName('UPPER')).toBe(false)
    expect(isValidProjectName('-bad')).toBe(false)
    expect(isValidProjectName('bad-')).toBe(false)
  })
})

describe('applyReplacements', () => {
  test('rewrites scope, locale key, db, and titles', () => {
    const input = [
      '"name": "@starter"',
      '"name": "@starter/api"',
      "getItem('starter.locale')",
      'localhost:5432/starter',
      'Starter Health',
      'สถานะ Starter',
    ].join('\n')

    const out = applyReplacements(input, 'rezerch')
    expect(out).toContain('"name": "@rezerch"')
    expect(out).toContain('"name": "@rezerch/api"')
    expect(out).toContain("getItem('rezerch.locale')")
    expect(out).toContain('localhost:5432/rezerch')
    expect(out).toContain('Rezerch Health')
    expect(out).toContain('สถานะ Rezerch')
    expect(out).not.toContain('@starter')
  })

  test('titleCaseName handles kebab names', () => {
    expect(titleCaseName('my-cool-app')).toBe('My Cool App')
  })
})

describe('renameProject', () => {
  test('rewrites root @starter and workspaces to @rezerch', () => {
    const dir = makeFixture()
    const result = renameProject({ rootDir: dir, name: 'rezerch' })

    expect(result.name).toBe('rezerch')
    expect(result.changed.length).toBeGreaterThan(0)

    const root = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
      name: string
      scripts: { 'db:generate': string }
    }
    expect(root.name).toBe('@rezerch')
    expect(root.scripts['db:generate']).toContain('@rezerch/database')

    const api = JSON.parse(readFileSync(join(dir, 'apps', 'api', 'package.json'), 'utf8')) as {
      name: string
      dependencies: Record<string, string>
    }
    expect(api.name).toBe('@rezerch/api')
    expect(api.dependencies['@rezerch/shared']).toBe('workspace:*')

    const en = readFileSync(join(dir, 'packages', 'locale', 'src', 'en.ts'), 'utf8')
    expect(en).toContain('Rezerch Health')

    const th = readFileSync(join(dir, 'packages', 'locale', 'src', 'th.ts'), 'utf8')
    expect(th).toContain('สถานะ Rezerch')

    const app = readFileSync(join(dir, 'apps', 'api', 'app.ts'), 'utf8')
    expect(app).toContain('rezerch.locale')
    expect(app).toContain('localhost:5432/rezerch')

    // Skipped paths untouched
    expect(readFileSync(join(dir, 'node_modules', '@starter', 'pkg.json'), 'utf8')).toContain(
      '@starter/skip'
    )
    expect(readFileSync(join(dir, 'bun.lock'), 'utf8')).toContain('@starter/api')
  })

  test('dry-run does not write files', () => {
    const dir = makeFixture()
    renameProject({ rootDir: dir, name: 'rezerch', dryRun: true })
    const root = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { name: string }
    expect(root.name).toBe('@starter')
  })

  test('rejects invalid names', () => {
    const dir = makeFixture()
    expect(() => renameProject({ rootDir: dir, name: 'Bad Name' })).toThrow(/Invalid project name/)
  })
})
