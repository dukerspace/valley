import { Hono } from 'hono'
import type { AppEnv } from '../../../middleware/auth.ts'
import { createAuthMiddleware } from '../../../middleware/auth.ts'
import {
  createUserRepository,
  type UserRepository,
} from '../../user/repositories/user.repository.ts'
import { createPasswordHandlers } from '../handlers/password.handler.ts'
import { createPasswordService, type PasswordService } from '../services/password.service.ts'

export function createPasswordRouter(options: {
  repository?: UserRepository
  service?: PasswordService
  getFrontendUrl: () => string
}) {
  const repository = options.repository ?? createUserRepository()
  const service = options.service ?? createPasswordService(repository)
  const handlers = createPasswordHandlers(service, options.getFrontendUrl)
  const auth = createAuthMiddleware((id) => repository.findById(id))
  const router = new Hono<AppEnv>()

  router.put('/', auth, handlers.update)
  router.post('/forgot', handlers.forgot)
  router.post('/reset', handlers.reset)

  return { router, service }
}
