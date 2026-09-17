import { describe, expect, test } from 'bun:test'
import { createApp } from './app.ts'

describe('GET /health', () => {
  test('returns ok when database is up', async () => {
    const { app } = createApp({
      checkDatabase: async () => true,
      env: {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/starter',
        API_HOST: '127.0.0.1',
        API_PORT: '3001',
        API_URL: 'http://127.0.0.1:3001',
        FRONTEND_HOST: '127.0.0.1',
        FRONTEND_PORT: '3000',
        FRONTEND_URL: 'http://127.0.0.1:3000',
        CORS_ORIGIN: 'http://127.0.0.1:3000',
        NODE_ENV: 'test',
      },
    })

    const response = await app.request('/health')
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.database).toBe('up')
    expect(body.service).toBe('api')
  })

  test('returns degraded when database is down', async () => {
    const { app } = createApp({
      checkDatabase: async () => false,
      env: {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/starter',
        CORS_ORIGIN: 'http://127.0.0.1:3000',
        NODE_ENV: 'test',
      },
    })

    const response = await app.request('/health')
    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body.status).toBe('degraded')
    expect(body.database).toBe('down')
  })
})
