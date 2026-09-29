import { describe, expect, test } from 'bun:test'
import { catalogs, locales, type Messages } from './index.ts'

function collectKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) {
    return [prefix]
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key)
  )
}

describe('locale catalogs', () => {
  test('en and th expose the same keys', () => {
    const enKeys = collectKeys(catalogs.en).sort()
    const thKeys = collectKeys(catalogs.th).sort()
    expect(thKeys).toEqual(enKeys)
  })

  test('every locale is present in catalogs', () => {
    for (const locale of locales) {
      expect(catalogs[locale]).toBeDefined()
    }
  })

  test('Messages type covers nested keys', () => {
    const sample: Messages['health']['retry'] = catalogs.en.health.retry
    expect(sample.length).toBeGreaterThan(0)
  })
})
