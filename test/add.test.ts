import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { addPackages } from '../src/add.ts'
import { SHARED_PACKAGES_ROOT } from '../src/paths.ts'

const temps: string[] = []

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function makeProjectFixture(scope = 'demo'): string {
  const root = mkdtempSync(join(tmpdir(), 'valley-add-proj-'))
  temps.push(root)
  mkdirSync(join(root, 'apps', 'api'), { recursive: true })
  mkdirSync(join(root, 'packages'), { recursive: true })
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: `@${scope}`, private: true, workspaces: ['apps/*', 'packages/*'] }, null, 2)
  )
  writeFileSync(
    join(root, 'apps', 'api', 'package.json'),
    JSON.stringify(
      {
        name: `@${scope}/api`,
        dependencies: { [`@${scope}/shared`]: '*' },
      },
      null,
      2
    )
  )
  writeFileSync(join(root, '.env.example'), 'SECRET=\nNODE_ENV="development"\n')
  return root
}

describe('addPackages', () => {
  test('copies package, renames scope, links api, appends env', async () => {
    const root = makeProjectFixture('demo')
    const result = await addPackages({
      cwd: root,
      packages: ['ai'],
      packagesRoot: SHARED_PACKAGES_ROOT,
      noInstall: true,
    })

    expect(result.added).toEqual(['ai'])
    expect(result.linked).toEqual(['ai'])
    expect(result.scope).toBe('demo')
    expect(existsSync(join(root, 'packages', 'ai', 'package.json'))).toBe(true)

    const pkg = JSON.parse(readFileSync(join(root, 'packages', 'ai', 'package.json'), 'utf8')) as {
      name: string
    }
    expect(pkg.name).toBe('@demo/ai')

    const api = JSON.parse(readFileSync(join(root, 'apps', 'api', 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }
    expect(api.dependencies['@demo/ai']).toBe('*')

    const env = readFileSync(join(root, '.env.example'), 'utf8')
    expect(env).toContain('# --- Optional: ai ---')
    expect(env).toContain('OPENAI_API_KEY')
  })

  test('dry-run does not write files', async () => {
    const root = makeProjectFixture('demo')
    await addPackages({
      cwd: root,
      packages: ['stripe'],
      packagesRoot: SHARED_PACKAGES_ROOT,
      dryRun: true,
      noInstall: true,
    })
    expect(existsSync(join(root, 'packages', 'stripe'))).toBe(false)
    const api = JSON.parse(readFileSync(join(root, 'apps', 'api', 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }
    expect(api.dependencies['@demo/stripe']).toBeUndefined()
  })

  test('errors when package already exists', async () => {
    const root = makeProjectFixture('demo')
    mkdirSync(join(root, 'packages', 'ai'), { recursive: true })
    writeFileSync(join(root, 'packages', 'ai', 'package.json'), '{"name":"@demo/ai"}\n')

    await expect(
      addPackages({
        cwd: root,
        packages: ['ai'],
        packagesRoot: SHARED_PACKAGES_ROOT,
        noInstall: true,
      })
    ).rejects.toThrow(/Package already exists: packages\/ai/)
  })

  test('errors when not a valley project', async () => {
    const root = mkdtempSync(join(tmpdir(), 'valley-add-bad-'))
    temps.push(root)
    writeFileSync(join(root, 'package.json'), '{"name":"@demo"}\n')

    await expect(
      addPackages({
        cwd: root,
        packages: ['ai'],
        packagesRoot: SHARED_PACKAGES_ROOT,
        noInstall: true,
      })
    ).rejects.toThrow(/Not a valley project/)
  })

  test('errors when no packages given', async () => {
    const root = makeProjectFixture('demo')
    await expect(
      addPackages({
        cwd: root,
        packages: [],
        packagesRoot: SHARED_PACKAGES_ROOT,
        noInstall: true,
      })
    ).rejects.toThrow(/No packages to add/)
  })
})
