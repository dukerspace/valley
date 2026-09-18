import type { Context } from 'hono'
import type { HealthService } from '../services/health.service.ts'
import { healthService } from '../services/health.service.ts'

export function createHealthHandlers(service: HealthService) {
  return {
    getHealth: async (c: Context) => {
      const { payload, ok } = await service.getHealth()
      return c.json(payload, ok ? 200 : 503)
    },
  }
}

const defaultHandlers = createHealthHandlers(healthService)

export const getHealth = defaultHandlers.getHealth
