import type { Context } from 'hono'
import { healthService } from '../services/health.service.ts'

export async function getHealth(c: Context) {
  const { payload, ok } = await healthService.getHealth()
  return c.json(payload, ok ? 200 : 503)
}
