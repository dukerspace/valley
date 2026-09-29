import {
  healthResponseSchema,
  type HealthResponse,
} from '@valley/shared'
import { healthRepository } from '../repositories/health.repository.ts'
import {
  getAppVersion,
  getRuntime,
  getTimestamp,
  getUptimeSeconds,
} from '../utils/health.utils.ts'

class HealthService {
  async getHealth(): Promise<{ payload: HealthResponse; ok: boolean }> {
    const database = await healthRepository.check()
    const payload: HealthResponse = {
      status: database.ok ? 'ok' : 'degraded',
      service: 'api',
      version: getAppVersion(),
      uptimeSeconds: getUptimeSeconds(),
      runtime: getRuntime(),
      database: database.ok ? 'up' : 'down',
      databaseVersion: database.version ?? undefined,
      timestamp: getTimestamp(),
      message: database.ok ? undefined : 'Database connection failed',
    }

    return {
      payload: healthResponseSchema.parse(payload),
      ok: database.ok,
    }
  }
}

export const healthService = new HealthService()
