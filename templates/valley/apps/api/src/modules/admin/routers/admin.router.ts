import { Hono } from 'hono'
import { ROLE } from '@valley/shared'
import type { AppEnv } from '../../../middleware/auth.ts'
import { createAdminAuthMiddleware, requireAdminRole } from '../../../middleware/auth.ts'
import { createAdminHandlers } from '../handlers/admin.handler.ts'
import {
  createAdminRepository,
  type AdminRepository,
} from '../repositories/admin.repository.ts'
import { createAdminService, type AdminService } from '../services/admin.service.ts'

export function createAdminsRouter(options: {
  repository?: AdminRepository
  service?: AdminService
  getBackofficeUrl: () => string
  usersRouter?: Hono<AppEnv>
}) {
  const repository = options.repository ?? createAdminRepository()
  const service = options.service ?? createAdminService(repository)
  const handlers = createAdminHandlers(service, options.getBackofficeUrl)
  const adminAuth = createAdminAuthMiddleware((id) => service.findById(id))
  const superAdmin = requireAdminRole(ROLE.SUPER_ADMIN)
  const router = new Hono<AppEnv>()

  router.get('/init', handlers.canInit)
  router.post('/init', handlers.init)
  router.post('/login', handlers.login)
  router.post('/refresh', handlers.refresh)
  router.post('/forgot-password', handlers.forgot)
  router.post('/reset-password', handlers.reset)

  router.get('/me', adminAuth, handlers.me)

  if (options.usersRouter) {
    router.route('/users', options.usersRouter)
  }

  router.get('/', adminAuth, superAdmin, handlers.list)
  router.post('/', adminAuth, superAdmin, handlers.create)
  router.patch('/:id', adminAuth, superAdmin, handlers.update)
  router.delete('/:id', adminAuth, superAdmin, handlers.remove)

  return { router, service, repository }
}
