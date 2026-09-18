import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createProject } from '../src/create.ts'

const temps: string[] = []

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

/** Mirrors templates/valley including agent/skill playbooks. */
function makeTemplateFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'valley-create-src-'))
  temps.push(dir)

  mkdirSync(join(dir, 'apps', 'api'), { recursive: true })
  mkdirSync(join(dir, 'node_modules', '@valley'), { recursive: true })
  mkdirSync(join(dir, '.git'), { recursive: true })
  mkdirSync(join(dir, '.skills', 'backend'), { recursive: true })
  mkdirSync(join(dir, '.agents'), { recursive: true })

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
    JSON.stringify({ name: '@valley/api' }, null, 2)
  )
  writeFileSync(join(dir, 'node_modules', '@valley', 'pkg.json'), '{"name":"@valley/skip"}\n')
  writeFileSync(join(dir, '.git', 'config'), '[core]\n')
  writeFileSync(join(dir, '.env'), 'SECRET=1\n')
  writeFileSync(join(dir, '.env.example'), 'SECRET=\n')
  writeFileSync(join(dir, '.skills', 'backend', 'SKILL.md'), '# Backend skill\n')
  writeFileSync(join(dir, '.agents', 'backend.md'), '# Backend agent\n')

  return dir
}

describe('createProject', () => {
  test('refuses invalid names', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    await expect(
      createProject({
        name: 'Bad Name',
        cwd,
        sourceRoot: makeTemplateFixture(),
        noInstall: true,
        noGit: true,
      })
    ).rejects.toThrow(/Invalid project name/)
  })

  test('refuses existing destination', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    mkdirSync(join(cwd, 'exists'))
    await expect(
      createProject({
        name: 'exists',
        cwd,
        sourceRoot: makeTemplateFixture(),
        noInstall: true,
        noGit: true,
      })
    ).rejects.toThrow(/already exists/)
  })

  test('refuses missing template', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    await expect(
      createProject({
        name: 'gone',
        cwd,
        sourceRoot: join(cwd, 'no-such-template'),
        noInstall: true,
        noGit: true,
      })
    ).rejects.toThrow(/Template not found/)
  })

  test('scaffolds from template and renames @valley packages', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    const src = makeTemplateFixture()

    const result = await createProject({
      name: 'rezerch',
      cwd,
      sourceRoot: src,
      noInstall: true,
      noGit: true,
    })

    expect(result.name).toBe('rezerch')
    expect(existsSync(result.destRoot)).toBe(true)
    expect(existsSync(join(result.destRoot, 'scripts', 'rename-project.ts'))).toBe(false)

    const root = JSON.parse(readFileSync(join(result.destRoot, 'package.json'), 'utf8')) as {
      name: string
      bin?: unknown
      scripts: Record<string, string>
    }
    expect(root.name).toBe('@rezerch')
    expect(root.bin).toBeUndefined()
    expect(root.scripts.rename).toBeUndefined()
    expect(root.scripts['db:generate']).toContain('@rezerch/database')

    const api = JSON.parse(
      readFileSync(join(result.destRoot, 'apps', 'api', 'package.json'), 'utf8')
    ) as { name: string }
    expect(api.name).toBe('@rezerch/api')

    expect(existsSync(join(result.destRoot, '.skills', 'backend', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(result.destRoot, '.agents', 'backend.md'))).toBe(true)
    expect(existsSync(join(result.destRoot, 'node_modules'))).toBe(false)
    expect(existsSync(join(result.destRoot, '.git'))).toBe(false)
  })

  test('dry-run does not create destination', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    const src = makeTemplateFixture()

    await createProject({
      name: 'dry-app',
      cwd,
      sourceRoot: src,
      noInstall: true,
      noGit: true,
      dryRun: true,
    })

    expect(existsSync(join(cwd, 'dry-app'))).toBe(false)
  })
})
