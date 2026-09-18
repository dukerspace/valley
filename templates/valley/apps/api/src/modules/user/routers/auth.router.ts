import { Hono } from 'hono'
import type { AppEnv } from '../../../middleware/auth.ts'
import { createUserHandlers } from '../handlers/user.handler.ts'
import {
  createUserRepository,
  type UserRepository,
} from '../repositories/user.repository.ts'
import { createUserService, type UserService } from '../services/user.service.ts'

export function createAuthRouter(options?: {
  service?: UserService
  repository?: UserRepository
}) {
  const repository = options?.repository ?? createUserRepository()
  const service = options?.service ?? createUserService(repository)
  const handlers = createUserHandlers(service)
  const router = new Hono<AppEnv>()

  router.post('/login', handlers.login)
  router.post('/refresh', handlers.refresh)
  router.post('/logout', handlers.logout)

  return { router, service, repository }
}
