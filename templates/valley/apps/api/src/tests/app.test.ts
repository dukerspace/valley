import { describe, expect, test } from 'bun:test'
import { createApp } from '../app.ts'
import type { HealthRepository } from '../modules/health/index.ts'

const testEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/valley',
  JWT_SECRET: 'test-jwt-secret-at-least-16-chars',
  API_HOST: '127.0.0.1',
  API_PORT: '3001',
  API_URL: 'http://127.0.0.1:3001',
  FRONTEND_HOST: '127.0.0.1',
  FRONTEND_PORT: '3000',
  FRONTEND_URL: 'http://127.0.0.1:3000',
  BACKOFFICE_HOST: '127.0.0.1',
  BACKOFFICE_PORT: '3002',
  BACKOFFICE_URL: 'http://127.0.0.1:3002',
  CORS_ORIGIN: 'http://127.0.0.1:3000,http://127.0.0.1:3002',
  NODE_ENV: 'test',
} as const

function createFakeRepository(result: {
  ok: boolean
  version: string | null
}): HealthRepository {
  return {
    check: async () => result,
  }
}

describe('GET /api/v1/health', () => {
  test('returns ok when database is up', async () => {
    const { app } = createApp({
      healthRepository: createFakeRepository({ ok: true, version: '16.4' }),
      env: testEnv,
    })

    const response = await app.request('/api/v1/health')
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.database).toBe('up')
    expect(body.service).toBe('api')
    expect(body.databaseVersion).toBe('16.4')
    expect(typeof body.version).toBe('string')
    expect(body.version.length).toBeGreaterThan(0)
    expect(typeof body.uptimeSeconds).toBe('number')
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0)
    expect(typeof body.runtime).toBe('string')
    expect(body.runtime.length).toBeGreaterThan(0)
  })

  test('returns degraded when database is down', async () => {
    const { app } = createApp({
      healthRepository: createFakeRepository({ ok: false, version: null }),
      env: {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/valley',
        JWT_SECRET: 'test-jwt-secret-at-least-16-chars',
        CORS_ORIGIN: 'http://127.0.0.1:3000',
        NODE_ENV: 'test',
      },
    })

    const response = await app.request('/api/v1/health')
    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body.status).toBe('degraded')
    expect(body.database).toBe('down')
    expect(body.message).toBe('Database connection failed')
  })
})
