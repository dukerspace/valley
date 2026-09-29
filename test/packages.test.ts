import { describe, expect, test } from 'bun:test'
import {
  applyPackageSelection,
  parsePackagesFlag,
  pruneEnvExample,
  OPTIONAL_PACKAGES,
} from '../src/packages.ts'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach } from 'bun:test'

const temps: string[] = []

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('parsePackagesFlag', () => {
  test('parses comma-separated optional packages', () => {
    expect(parsePackagesFlag('stripe,ai')).toEqual(['ai', 'stripe'])
    expect(parsePackagesFlag(' email , storage ')).toEqual(['email', 'storage'])
    expect(parsePackagesFlag('')).toEqual([])
  })

  test('rejects unknown packages', () => {
    expect(() => parsePackagesFlag('foo')).toThrow(/Unknown package "foo"/)
    expect(() => parsePackagesFlag('ai,payments')).toThrow(/Unknown package "payments"/)
  })
})

describe('pruneEnvExample', () => {
  const sample = [
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
  ].join('\n')

  test('keeps only selected optional sections', () => {
    const next = pruneEnvExample(sample, new Set(['stripe']))
    expect(next).toContain('# --- Optional: stripe ---')
    expect(next).toContain('# STRIPE_SECRET_KEY=""')
    expect(next).not.toContain('# --- Optional: ai ---')
    expect(next).not.toContain('OPENAI_API_KEY')
    expect(next).not.toContain('AI_PROVIDER')
  })
})

describe('applyPackageSelection', () => {
  test('removes unselected packages and links selected into api', () => {
    const root = mkdtempSync(join(tmpdir(), 'valley-pkg-sel-'))
    temps.push(root)
    mkdirSync(join(root, 'apps', 'api'), { recursive: true })
    for (const id of OPTIONAL_PACKAGES) {
      mkdirSync(join(root, 'packages', id), { recursive: true })
      writeFileSync(join(root, 'packages', id, 'marker'), id)
    }
    writeFileSync(
      join(root, 'apps', 'api', 'package.json'),
      JSON.stringify({ name: '@valley/api', dependencies: { '@valley/shared': '*' } }, null, 2)
    )
    writeFileSync(
      join(root, '.env.example'),
      [
        'SECRET=',
        '# --- Optional: ai ---',
        '# AI_PROVIDER="openai"   # openai | anthropic | google | openrouter',
        '# AI_MODEL=""',
        '# AI_BASE_URL=""',
        '# OPENAI_API_KEY=""',
        '# ANTHROPIC_API_KEY=""',
        '# GOOGLE_GENERATIVE_AI_API_KEY=""',
        '# OPENROUTER_API_KEY=""',
        '# --- Optional: stripe ---',
        '# STRIPE_SECRET_KEY=""',
        '# --- Optional: email ---',
        '# RESEND_API_KEY=""',
        '# --- Optional: storage ---',
        '# S3_BUCKET=""',
      ].join('\n')
    )

    const result = applyPackageSelection(root, ['ai', 'email'])
    expect(result.removed).toEqual(['stripe', 'storage'])
    expect(result.linked).toEqual(['ai', 'email'])
    expect(readFileSync(join(root, 'packages', 'ai', 'marker'), 'utf8')).toBe('ai')
    expect(() => readFileSync(join(root, 'packages', 'stripe', 'marker'), 'utf8')).toThrow()

    const api = JSON.parse(readFileSync(join(root, 'apps', 'api', 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }
    expect(api.dependencies['@valley/ai']).toBe('*')
    expect(api.dependencies['@valley/email']).toBe('*')
    expect(api.dependencies['@valley/stripe']).toBeUndefined()
  })
})
