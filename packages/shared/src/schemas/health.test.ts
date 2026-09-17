import { describe, expect, test } from 'bun:test'
import { healthResponseSchema } from './health.ts'

describe('healthResponseSchema', () => {
  test('accepts a valid healthy payload', () => {
    const payload = {
      status: 'ok',
      service: 'api',
      database: 'up',
      timestamp: new Date().toISOString(),
    } as const

    expect(healthResponseSchema.parse(payload)).toMatchObject(payload)
  })

  test('rejects an invalid service name', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      service: 'web',
      database: 'up',
      timestamp: new Date().toISOString(),
    })

    expect(result.success).toBe(false)
  })
})
