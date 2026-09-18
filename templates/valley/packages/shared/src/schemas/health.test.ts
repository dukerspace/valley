import { describe, expect, test } from 'bun:test'
import { healthResponseSchema } from './health.ts'

describe('healthResponseSchema', () => {
  test('accepts a valid healthy payload', () => {
    const payload = {
      status: 'ok',
      service: 'api',
      version: '0.0.0',
      uptimeSeconds: 12.5,
      runtime: '1.2.3',
      database: 'up',
      databaseVersion: '16.4',
      timestamp: new Date().toISOString(),
    } as const

    expect(healthResponseSchema.parse(payload)).toMatchObject(payload)
  })

  test('rejects missing version and uptimeSeconds', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      service: 'api',
      database: 'up',
      timestamp: new Date().toISOString(),
    })

    expect(result.success).toBe(false)
  })

  test('rejects an invalid service name', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      service: 'web',
      version: '0.0.0',
      uptimeSeconds: 1,
      runtime: '1.2.3',
      database: 'up',
      timestamp: new Date().toISOString(),
    })

    expect(result.success).toBe(false)
  })
})
