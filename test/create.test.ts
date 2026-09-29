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

/** Mirrors templates/valley (apps + config; no packages/playbooks). */
function makeTemplateFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'valley-create-src-'))
  temps.push(dir)

  mkdirSync(join(dir, 'apps', 'api'), { recursive: true })
  mkdirSync(join(dir, 'node_modules', '@valley'), { recursive: true })
  mkdirSync(join(dir, '.git'), { recursive: true })
  // Symlink stand-ins: must be skipped by copyTemplate
  mkdirSync(join(dir, 'packages', 'should-skip'), { recursive: true })
  writeFileSync(join(dir, 'packages', 'should-skip', 'package.json'), '{"name":"skip"}\n')
  mkdirSync(join(dir, '.skills', 'should-skip'), { recursive: true })
  writeFileSync(join(dir, '.skills', 'should-skip', 'SKILL.md'), '# skip\n')
  mkdirSync(join(dir, '.agents'), { recursive: true })
  writeFileSync(join(dir, '.agents', 'should-skip.md'), '# skip\n')
  mkdirSync(join(dir, '.cursor', 'rules'), { recursive: true })
  writeFileSync(join(dir, '.cursor', 'rules', 'should-skip.mdc'), '# skip\n')

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
      {
        name: '@valley/api',
        dependencies: {
          '@valley/database': '*',
          '@valley/shared': '*',
        },
      },
      null,
      2
    )
  )
  writeFileSync(join(dir, 'node_modules', '@valley', 'pkg.json'), '{"name":"@valley/skip"}\n')
  writeFileSync(join(dir, '.git', 'config'), '[core]\n')
  writeFileSync(join(dir, '.env'), 'SECRET=1\n')
  writeFileSync(
    join(dir, '.env.example'),
    [
      'SECRET=',
      '',
      '# --- Optional: ai ---',
      '# AI_PROVIDER="openai"   # openai | anthropic | google | openrouter',
      '# AI_MODEL=""',
      '# AI_BASE_URL=""',
      '# OPENAI_API_KEY=""',
      '# ANTHROPIC_API_KEY=""',
      '# GOOGLE_GENERATIVE_AI_API_KEY=""',
      '# OPENROUTER_API_KEY=""',
      '',
      '# --- Optional: stripe ---',
      '# STRIPE_SECRET_KEY=""',
      '',
      '# --- Optional: email ---',
      '# RESEND_API_KEY=""',
      '',
      '# --- Optional: storage ---',
      '# S3_BUCKET=""',
      '',
    ].join('\n')
  )

  return dir
}

/** Mirrors repo-root packages/ (core + optional). */
function makePackagesFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'valley-packages-'))
  temps.push(dir)

  for (const pkg of ['database', 'shared', 'ui', 'locale', 'ai', 'stripe', 'email', 'storage']) {
    mkdirSync(join(dir, pkg, 'src'), { recursive: true })
    writeFileSync(
      join(dir, pkg, 'package.json'),
      JSON.stringify({ name: `@valley/${pkg}`, private: true }, null, 2)
    )
    writeFileSync(join(dir, pkg, 'src', 'index.ts'), `export const name = '${pkg}'\n`)
  }

  return dir
}

/** Mirrors CLI-repo .agents / .skills / .cursor/rules. */
function makePlaybooksFixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'valley-playbooks-'))
  temps.push(dir)

  mkdirSync(join(dir, '.skills', 'backend'), { recursive: true })
  mkdirSync(join(dir, '.agents'), { recursive: true })
  mkdirSync(join(dir, '.cursor', 'rules'), { recursive: true })
  writeFileSync(join(dir, '.skills', 'backend', 'SKILL.md'), '# Backend skill\n')
  writeFileSync(join(dir, '.agents', 'backend.md'), '# Backend agent\n')
  writeFileSync(join(dir, '.cursor', 'rules', 'locale-parity.mdc'), '# Locale parity\n')

  return dir
}

function createOpts(overrides: Parameters<typeof createProject>[0]) {
  return {
    packagesRoot: makePackagesFixture(),
    playbooksRoot: makePlaybooksFixture(),
    noInstall: true,
    noGit: true,
    ...overrides,
    sourceRoot: overrides.sourceRoot ?? makeTemplateFixture(),
  }
}

describe('createProject', () => {
  test('refuses invalid names', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    await expect(createProject(createOpts({ name: 'Bad Name', cwd }))).rejects.toThrow(
      /Invalid project name/
    )
  })

  test('refuses existing destination', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    mkdirSync(join(cwd, 'exists'))
    await expect(createProject(createOpts({ name: 'exists', cwd }))).rejects.toThrow(
      /already exists/
    )
  })

  test('refuses missing template', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    await expect(
      createProject(
        createOpts({
          name: 'gone',
          cwd,
          sourceRoot: join(cwd, 'no-such-template'),
        })
      )
    ).rejects.toThrow(/Template not found/)
  })

  test('refuses missing shared packages', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    await expect(
      createProject(
        createOpts({
          name: 'nopkgs',
          cwd,
          packagesRoot: join(cwd, 'no-such-packages'),
        })
      )
    ).rejects.toThrow(/Shared packages not found/)
  })

  test('refuses missing CLI playbooks', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)
    await expect(
      createProject(
        createOpts({
          name: 'noplay',
          cwd,
          playbooksRoot: join(cwd, 'no-such-playbooks'),
        })
      )
    ).rejects.toThrow(/CLI playbook path not found/)
  })

  test('scaffolds from template and renames @valley packages', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)

    const result = await createProject(createOpts({ name: 'rezerch', cwd }))

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
    expect(existsSync(join(result.destRoot, '.cursor', 'rules', 'locale-parity.mdc'))).toBe(true)
    expect(existsSync(join(result.destRoot, '.skills', 'should-skip'))).toBe(false)
    expect(existsSync(join(result.destRoot, '.agents', 'should-skip.md'))).toBe(false)
    expect(existsSync(join(result.destRoot, 'node_modules'))).toBe(false)
    expect(existsSync(join(result.destRoot, '.git'))).toBe(false)
    expect(existsSync(join(result.destRoot, 'packages', 'database'))).toBe(true)
    expect(existsSync(join(result.destRoot, 'packages', 'shared'))).toBe(true)
    expect(existsSync(join(result.destRoot, 'packages', 'should-skip'))).toBe(false)
  })

  test('dry-run does not create destination', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)

    await createProject(createOpts({ name: 'dry-app', cwd, dryRun: true }))

    expect(existsSync(join(cwd, 'dry-app'))).toBe(false)
  })

  test('keeps selected optional packages and links them into api', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)

    const result = await createProject(
      createOpts({ name: 'with-opts', cwd, packages: ['ai', 'stripe'] })
    )

    expect(existsSync(join(result.destRoot, 'packages', 'ai'))).toBe(true)
    expect(existsSync(join(result.destRoot, 'packages', 'stripe'))).toBe(true)
    expect(existsSync(join(result.destRoot, 'packages', 'email'))).toBe(false)
    expect(existsSync(join(result.destRoot, 'packages', 'storage'))).toBe(false)
    expect(existsSync(join(result.destRoot, 'packages', 'database'))).toBe(true)

    const api = JSON.parse(
      readFileSync(join(result.destRoot, 'apps', 'api', 'package.json'), 'utf8')
    ) as { dependencies: Record<string, string> }
    expect(api.dependencies['@with-opts/ai']).toBe('*')
    expect(api.dependencies['@with-opts/stripe']).toBe('*')
    expect(api.dependencies['@with-opts/email']).toBeUndefined()

    const env = readFileSync(join(result.destRoot, '.env.example'), 'utf8')
    expect(env).toContain('# --- Optional: ai ---')
    expect(env).toContain('AI_PROVIDER')
    expect(env).toContain('OPENROUTER_API_KEY')
    expect(env).toContain('# --- Optional: stripe ---')
    expect(env).not.toContain('# --- Optional: email ---')
    expect(env).not.toContain('# --- Optional: storage ---')
  })

  test('removes all optional packages when none selected', async () => {
    const cwd = mkdtempSync(join(tmpdir(), 'valley-create-cwd-'))
    temps.push(cwd)

    const result = await createProject(createOpts({ name: 'bare', cwd, packages: [] }))

    for (const id of ['ai', 'stripe', 'email', 'storage']) {
      expect(existsSync(join(result.destRoot, 'packages', id))).toBe(false)
    }
    expect(existsSync(join(result.destRoot, 'packages', 'shared'))).toBe(true)

    const env = readFileSync(join(result.destRoot, '.env.example'), 'utf8')
    expect(env).not.toContain('# --- Optional:')
  })
})
