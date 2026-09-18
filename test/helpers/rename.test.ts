import { afterEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyReplacements, renameProject, titleCaseName } from '../../src/helpers/rename.ts'

const temps: string[] = []

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function makeFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'valley-rename-'))
  temps.push(dir)
  mkdirSync(join(dir, 'apps', 'api'), { recursive: true })
  mkdirSync(join(dir, 'packages', 'locale', 'src'), { recursive: true })

  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(
      {
        name: '@valley',
        private: true,
        scripts: {
          'db:generate': 'turbo run db:generate --filter=@valley/database',
        },
      },
      null,
      2
    )
  )
  writeFileSync(
    join(dir, 'apps', 'api', 'package.json'),
    JSON.stringify(
      { name: '@valley/api', dependencies: { '@valley/shared': '*' } },
      null,
      2
    )
  )
  writeFileSync(
    join(dir, 'packages', 'locale', 'src', 'en.ts'),
    "export const en = { app: { title: 'Valley Health' } }\n"
  )
  writeFileSync(
    join(dir, 'packages', 'locale', 'src', 'th.ts'),
    "export const th = { app: { title: 'สถานะ Valley' } }\n"
  )
  writeFileSync(
    join(dir, 'apps', 'api', 'app.ts'),
    "const key = 'valley.locale'\nconst url = 'postgresql://postgres:postgres@localhost:5432/valley'\n"
  )
  mkdirSync(join(dir, 'node_modules', '@valley'), { recursive: true })
  writeFileSync(join(dir, 'node_modules', '@valley', 'pkg.json'), '{"name":"@valley/skip"}\n')
  writeFileSync(join(dir, 'bun.lock'), 'workspace @valley/api\n')

  return dir
}

describe('applyReplacements', () => {
  test('rewrites scope, locale key, db, titles, and cookie prefixes', () => {
    const input = [
      '"name": "@valley"',
      '"name": "@valley/api"',
      "getItem('valley.locale')",
      'localhost:5432/valley',
      'Valley Health',
      'Valley Backoffice',
      'สถานะ Valley',
      'valley_access_token',
      'valley_admin_access_token',
    ].join('\n')

    const out = applyReplacements(input, 'rezerch')
    expect(out).toContain('"name": "@rezerch"')
    expect(out).toContain('"name": "@rezerch/api"')
    expect(out).toContain("getItem('rezerch.locale')")
    expect(out).toContain('localhost:5432/rezerch')
    expect(out).toContain('Rezerch Health')
    expect(out).toContain('Rezerch Backoffice')
    expect(out).toContain('สถานะ Rezerch')
    expect(out).toContain('rezerch_access_token')
    expect(out).toContain('rezerch_admin_access_token')
    expect(out).not.toContain('@valley')
    expect(out).not.toContain('valley_access_token')
  })

  test('titleCaseName handles kebab names', () => {
    expect(titleCaseName('my-cool-app')).toBe('My Cool App')
  })
})

describe('renameProject', () => {
  test('rewrites root @valley and workspaces to @rezerch', () => {
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
    expect(api.dependencies['@rezerch/shared']).toBe('*')

    const en = readFileSync(join(dir, 'packages', 'locale', 'src', 'en.ts'), 'utf8')
    expect(en).toContain('Rezerch Health')

    const th = readFileSync(join(dir, 'packages', 'locale', 'src', 'th.ts'), 'utf8')
    expect(th).toContain('สถานะ Rezerch')

    const app = readFileSync(join(dir, 'apps', 'api', 'app.ts'), 'utf8')
    expect(app).toContain('rezerch.locale')
    expect(app).toContain('localhost:5432/rezerch')

    expect(readFileSync(join(dir, 'node_modules', '@valley', 'pkg.json'), 'utf8')).toContain(
      '@valley/skip'
    )
    expect(readFileSync(join(dir, 'bun.lock'), 'utf8')).toContain('@valley/api')
  })

  test('dry-run does not write files', () => {
    const dir = makeFixture()
    renameProject({ rootDir: dir, name: 'rezerch', dryRun: true })
    const root = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { name: string }
    expect(root.name).toBe('@valley')
  })

  test('no-op when name is valley', () => {
    const dir = makeFixture()
    const result = renameProject({ rootDir: dir, name: 'valley' })
    expect(result.changed).toEqual([])
    const root = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { name: string }
    expect(root.name).toBe('@valley')
  })

  test('rejects invalid names', () => {
    const dir = makeFixture()
    expect(() => renameProject({ rootDir: dir, name: 'Bad Name' })).toThrow(/Invalid project name/)
  })
})
