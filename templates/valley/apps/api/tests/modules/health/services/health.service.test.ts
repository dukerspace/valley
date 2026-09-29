import { describe, expect, it, mock } from 'bun:test'

mock.module('../../../../src/modules/health/repositories/health.repository.ts', () => ({
  healthRepository: {
    check: mock(async () => ({ ok: true, version: '16.4' })),
  },
}))

const { healthService } = await import('../../../../src/modules/health/services/health.service.ts')

describe('HealthService.getHealth', () => {
  it('returns ok when database is up', async () => {
    const { payload, ok } = await healthService.getHealth()
    expect(ok).toBe(true)
    expect(payload.status).toBe('ok')
    expect(payload.database).toBe('up')
  })
})
