import { Hono } from 'hono'
import {
  createHealthHandlers,
  getHealth,
} from '../handlers/health.handler.ts'
import type { HealthRepository } from '../repositories/health.repository.ts'
import { HealthService } from '../services/health.service.ts'

export function createHealthRoutes(options?: {
  repository?: HealthRepository
}) {
  const router = new Hono()

  if (options?.repository) {
    const service = new HealthService(options.repository)
    const handlers = createHealthHandlers(service)
    router.get('/', handlers.getHealth)
    return router
  }

  router.get('/', getHealth)
  return router
}

export const healthRoutes = createHealthRoutes()
