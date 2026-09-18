import type { Hono } from 'hono'
import type { AppEnv } from '../middleware/auth.ts'
import {
  createAdminRepository,
  createAdminService,
  createAdminsRouter,
  type AdminRepository,
} from '../modules/admin/index.ts'
import {
  createHealthRoutes,
  healthRoutes,
  type HealthRepository,
} from '../modules/health/index.ts'
import { createPasswordRouter } from '../modules/password/index.ts'
import {
  createAdminUsersRouter,
  createAuthRouter,
  createUserRepository,
  createUserService,
  createUsersRouter,
  type UserRepository,
} from '../modules/user/index.ts'

export type RegisterV1Options = {
  healthRepository?: HealthRepository
  userRepository?: UserRepository
  adminRepository?: AdminRepository
  getFrontendUrl: () => string
  getBackofficeUrl: () => string
}

export function registerV1Routes(v1: Hono<AppEnv>, options: RegisterV1Options) {
  const userRepository = options.userRepository ?? createUserRepository()
  const adminRepository = options.adminRepository ?? createAdminRepository()
  const userService = createUserService(userRepository)
  const adminService = createAdminService(adminRepository)

  const users = createUsersRouter({
    repository: userRepository,
    service: userService,
  })
  const auth = createAuthRouter({
    repository: userRepository,
    service: userService,
  })
  const password = createPasswordRouter({
    repository: userRepository,
    getFrontendUrl: options.getFrontendUrl,
  })
  const adminUsers = createAdminUsersRouter({
    repository: userRepository,
    service: userService,
    adminLookup: (id) => adminService.findById(id),
  })
  const admins = createAdminsRouter({
    repository: adminRepository,
    service: adminService,
    getBackofficeUrl: options.getBackofficeUrl,
    usersRouter: adminUsers.router,
  })

  const health = options.healthRepository
    ? createHealthRoutes({ repository: options.healthRepository })
    : healthRoutes

  v1.route('/health', health)
  v1.route('/users', users.router)
  v1.route('/auth', auth.router)
  v1.route('/password', password.router)
  v1.route('/admins', admins.router)

  return { userRepository, adminRepository }
}
