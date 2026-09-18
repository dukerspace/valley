import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { copyTemplate, stripScaffolding } from '../../src/helpers/template.ts'
import { TEMPLATE_ROOT } from '../../src/paths.ts'

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

describe('TEMPLATE_ROOT', () => {
  test('points at templates/valley under the package root', () => {
    expect(TEMPLATE_ROOT.replace(/\\/g, '/')).toMatch(/templates\/valley$/)
    expect(existsSync(join(TEMPLATE_ROOT, 'package.json'))).toBe(true)
  })

  test('valley manifests use npm-compatible workspace versions', () => {
    const pkg = JSON.parse(readFileSync(join(TEMPLATE_ROOT, 'package.json'), 'utf8')) as {
      name: string
    }
    expect(pkg.name).toBe('@valley')

    for (const rel of ['apps/api/package.json', 'apps/frontend/package.json']) {
      const text = readFileSync(join(TEMPLATE_ROOT, rel), 'utf8')
      expect(text).not.toContain('workspace:')
    }
  })
})

describe('copyTemplate', () => {
  test('copies files and skips node_modules, .git, and local env', () => {
    const src = makeTemplateFixture()
    const destParent = mkdtempSync(join(tmpdir(), 'valley-create-dest-'))
    temps.push(destParent)
    const dest = join(destParent, 'my-app')

    const copied = copyTemplate(src, dest)
    expect(copied.some((f) => f.includes('package.json'))).toBe(true)
    expect(existsSync(join(dest, 'package.json'))).toBe(true)
    expect(existsSync(join(dest, '.env.example'))).toBe(true)
    expect(existsSync(join(dest, '.skills', 'backend', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(dest, '.agents', 'backend.md'))).toBe(true)
    expect(existsSync(join(dest, 'node_modules'))).toBe(false)
    expect(existsSync(join(dest, '.git'))).toBe(false)
    expect(existsSync(join(dest, '.env'))).toBe(false)
  })

  test('TEMPLATE_ROOT includes .skills and .agents', () => {
    expect(existsSync(join(TEMPLATE_ROOT, '.skills'))).toBe(true)
    expect(existsSync(join(TEMPLATE_ROOT, '.agents'))).toBe(true)
  })
})

describe('stripScaffolding', () => {
  test('removes bin, postinstall, create, and rename from package.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'valley-strip-'))
    temps.push(dir)
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify(
        {
          name: '@valley',
          bin: './src/index.ts',
          scripts: { postinstall: 'x', create: 'y', rename: 'z', dev: 'turbo' },
        },
        null,
        2
      )
    )
    mkdirSync(join(dir, 'scripts'), { recursive: true })
    writeFileSync(join(dir, 'scripts', 'create-project.mjs'), 'x')
    writeFileSync(join(dir, 'scripts', 'rename-project.ts'), 'x')
    mkdirSync(join(dir, 'src'), { recursive: true })
    writeFileSync(join(dir, 'src', 'index.ts'), 'x')
    writeFileSync(join(dir, 'src', 'create.ts'), 'x')

    stripScaffolding(dir)

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
      bin?: unknown
      scripts: Record<string, string>
    }
    expect(pkg.bin).toBeUndefined()
    expect(pkg.scripts.postinstall).toBeUndefined()
    expect(pkg.scripts.create).toBeUndefined()
    expect(pkg.scripts.rename).toBeUndefined()
    expect(pkg.scripts.dev).toBe('turbo')
    expect(existsSync(join(dir, 'scripts', 'create-project.mjs'))).toBe(false)
    expect(existsSync(join(dir, 'scripts', 'rename-project.ts'))).toBe(false)
    expect(existsSync(join(dir, 'src', 'index.ts'))).toBe(false)
    expect(existsSync(join(dir, 'src', 'create.ts'))).toBe(false)
  })
})
