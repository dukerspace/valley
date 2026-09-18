import {
  healthResponseSchema,
  type HealthResponse,
} from '@valley/shared'
import {
  healthRepository,
  type HealthRepository,
} from '../repositories/health.repository.ts'
import {
  getAppVersion,
  getRuntime,
  getTimestamp,
  getUptimeSeconds,
} from '../utils/health.utils.ts'

export class HealthService {
  constructor(private readonly repository: HealthRepository = healthRepository) {}

  async getHealth(): Promise<{ payload: HealthResponse; ok: boolean }> {
    const database = await this.repository.check()
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
