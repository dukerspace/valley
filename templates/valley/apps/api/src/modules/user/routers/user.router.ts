import { Hono } from 'hono'
import type { Admin } from '@valley/database'
import type { AppEnv } from '../../../middleware/auth.ts'
import { createAdminAuthMiddleware, createAuthMiddleware } from '../../../middleware/auth.ts'
import { createUserHandlers } from '../handlers/user.handler.ts'
import {
  createUserRepository,
  type UserRepository,
} from '../repositories/user.repository.ts'
import { createUserService, type UserService } from '../services/user.service.ts'

export function createUsersRouter(options?: {
  repository?: UserRepository
  service?: UserService
}) {
  const repository = options?.repository ?? createUserRepository()
  const service = options?.service ?? createUserService(repository)
  const handlers = createUserHandlers(service)
  const auth = createAuthMiddleware((id) => service.findById(id))
  const router = new Hono<AppEnv>()

  router.post('/', handlers.register)
  router.get('/me', auth, handlers.me)
  router.patch('/me', auth, handlers.updateMe)

  return { router, service, repository }
}

export function createAdminUsersRouter(options: {
  service?: UserService
  repository?: UserRepository
  adminLookup: (id: string) => Promise<Admin | null>
}) {
  const repository = options.repository ?? createUserRepository()
  const service = options.service ?? createUserService(repository)
  const handlers = createUserHandlers(service)
  const router = new Hono<AppEnv>()
  const adminAuth = createAdminAuthMiddleware(options.adminLookup)

  router.use('*', adminAuth)
  router.get('/', handlers.list)
  router.post('/', handlers.create)
  router.get('/:id', handlers.getById)
  router.patch('/:id', handlers.update)
  router.delete('/:id', handlers.remove)

  return { router, service, repository }
}
