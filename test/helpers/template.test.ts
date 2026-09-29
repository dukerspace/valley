import { afterEach, describe, expect, test } from 'bun:test'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { copyCliPlaybooks, copySharedPackages, copyTemplate, stripScaffolding } from '../../src/helpers/template.ts'
import { PACKAGE_ROOT, SHARED_PACKAGES_ROOT, TEMPLATE_ROOT } from '../../src/paths.ts'

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
  writeFileSync(join(dir, 'AGENTS.md'), '# Agents\n')

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

describe('SHARED_PACKAGES_ROOT', () => {
  test('contains the eight valley workspace packages', () => {
    expect(SHARED_PACKAGES_ROOT.replace(/\\/g, '/')).toMatch(/packages$/)
    expect(existsSync(SHARED_PACKAGES_ROOT)).toBe(true)
    for (const id of ['ai', 'database', 'email', 'locale', 'shared', 'storage', 'stripe', 'ui']) {
      expect(existsSync(join(SHARED_PACKAGES_ROOT, id, 'package.json'))).toBe(true)
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
    expect(existsSync(join(dest, 'AGENTS.md'))).toBe(true)
    expect(existsSync(join(dest, 'node_modules'))).toBe(false)
    expect(existsSync(join(dest, '.git'))).toBe(false)
    expect(existsSync(join(dest, '.env'))).toBe(false)
  })

  test('skips top-level packages, .agents, .skills, and .cursor', () => {
    const src = makeTemplateFixture()
    const pkgs = mkdtempSync(join(tmpdir(), 'valley-pkgs-'))
    temps.push(pkgs)
    mkdirSync(join(pkgs, 'shared', 'src'), { recursive: true })
    writeFileSync(join(pkgs, 'shared', 'package.json'), '{"name":"@valley/shared"}\n')
    writeFileSync(join(pkgs, 'shared', 'src', 'index.ts'), 'export {}\n')
    symlinkSync(pkgs, join(src, 'packages'))
    mkdirSync(join(src, '.agents'), { recursive: true })
    writeFileSync(join(src, '.agents', 'skip.md'), '# skip\n')
    mkdirSync(join(src, '.skills', 'skip'), { recursive: true })
    writeFileSync(join(src, '.skills', 'skip', 'SKILL.md'), '# skip\n')
    mkdirSync(join(src, '.cursor', 'rules'), { recursive: true })
    writeFileSync(join(src, '.cursor', 'rules', 'skip.mdc'), '# skip\n')

    const destParent = mkdtempSync(join(tmpdir(), 'valley-create-dest-'))
    temps.push(destParent)
    const dest = join(destParent, 'my-app')

    const copied = copyTemplate(src, dest)
    expect(copied.some((f) => f.startsWith('packages'))).toBe(false)
    expect(copied.some((f) => f.startsWith('.agents'))).toBe(false)
    expect(copied.some((f) => f.startsWith('.skills'))).toBe(false)
    expect(copied.some((f) => f.startsWith('.cursor'))).toBe(false)
    expect(existsSync(join(dest, 'packages'))).toBe(false)
    expect(existsSync(join(dest, '.agents'))).toBe(false)
  })

  test('TEMPLATE_ROOT has apps and AGENTS.md; packages live at SHARED_PACKAGES_ROOT', () => {
    expect(existsSync(join(TEMPLATE_ROOT, 'apps', 'api', 'package.json'))).toBe(true)
    expect(existsSync(join(TEMPLATE_ROOT, 'AGENTS.md'))).toBe(true)
    expect(existsSync(join(SHARED_PACKAGES_ROOT, 'shared', 'package.json'))).toBe(true)
  })
})

describe('copySharedPackages', () => {
  test('copies packages into destRoot/packages', () => {
    const pkgs = mkdtempSync(join(tmpdir(), 'valley-pkgs-'))
    temps.push(pkgs)
    mkdirSync(join(pkgs, 'shared', 'src'), { recursive: true })
    mkdirSync(join(pkgs, 'ai', 'src'), { recursive: true })
    writeFileSync(join(pkgs, 'shared', 'package.json'), '{"name":"@valley/shared"}\n')
    writeFileSync(join(pkgs, 'shared', 'src', 'index.ts'), 'export {}\n')
    writeFileSync(join(pkgs, 'ai', 'package.json'), '{"name":"@valley/ai"}\n')
    writeFileSync(join(pkgs, 'ai', 'src', 'index.ts'), 'export {}\n')
    mkdirSync(join(pkgs, 'node_modules'), { recursive: true })
    writeFileSync(join(pkgs, 'node_modules', 'x'), 'skip\n')

    const destParent = mkdtempSync(join(tmpdir(), 'valley-create-dest-'))
    temps.push(destParent)
    const dest = join(destParent, 'my-app')

    const copied = copySharedPackages(pkgs, dest)
    expect(copied.some((f) => f.replace(/\\/g, '/').startsWith('packages/'))).toBe(true)
    expect(existsSync(join(dest, 'packages', 'shared', 'package.json'))).toBe(true)
    expect(existsSync(join(dest, 'packages', 'ai', 'src', 'index.ts'))).toBe(true)
    expect(existsSync(join(dest, 'packages', 'node_modules'))).toBe(false)
    expect(readdirSync(join(dest, 'packages')).sort()).toEqual(['ai', 'shared'])
  })

  test('throws when packages root is missing', () => {
    const destParent = mkdtempSync(join(tmpdir(), 'valley-create-dest-'))
    temps.push(destParent)
    expect(() => copySharedPackages(join(destParent, 'missing'), join(destParent, 'app'))).toThrow(
      /Shared packages not found/
    )
  })
})

describe('copyCliPlaybooks', () => {
  test('copies .agents, .skills, and .cursor/rules into dest', () => {
    const root = mkdtempSync(join(tmpdir(), 'valley-cli-root-'))
    temps.push(root)
    mkdirSync(join(root, '.agents'), { recursive: true })
    mkdirSync(join(root, '.skills', 'backend'), { recursive: true })
    mkdirSync(join(root, '.cursor', 'rules'), { recursive: true })
    writeFileSync(join(root, '.agents', 'backend.md'), '# agent\n')
    writeFileSync(join(root, '.skills', 'backend', 'SKILL.md'), '# skill\n')
    writeFileSync(join(root, '.cursor', 'rules', 'locale-parity.mdc'), '# rule\n')

    const destParent = mkdtempSync(join(tmpdir(), 'valley-create-dest-'))
    temps.push(destParent)
    const dest = join(destParent, 'my-app')

    const copied = copyCliPlaybooks(root, dest)
    expect(copied.some((f) => f.replace(/\\/g, '/').startsWith('.agents/'))).toBe(true)
    expect(existsSync(join(dest, '.agents', 'backend.md'))).toBe(true)
    expect(existsSync(join(dest, '.skills', 'backend', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(dest, '.cursor', 'rules', 'locale-parity.mdc'))).toBe(true)
  })

  test('PACKAGE_ROOT includes the shipped playbook paths', () => {
    expect(existsSync(join(PACKAGE_ROOT, '.agents', 'backend.md'))).toBe(true)
    expect(existsSync(join(PACKAGE_ROOT, '.skills', 'backend', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(PACKAGE_ROOT, '.cursor', 'rules', 'locale-parity.mdc'))).toBe(true)
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
