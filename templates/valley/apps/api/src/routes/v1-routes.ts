import type { Hono } from 'hono'
import type { AppEnv } from '../middleware/auth.ts'
import { adminRoutes } from '../modules/admin/index.ts'
import { authRoutes, passwordRoutes } from '../modules/auth/index.ts'
import { healthRoutes } from '../modules/health/index.ts'
import { userRoutes } from '../modules/user/index.ts'

export function registerV1Routes(v1: Hono<AppEnv>) {
  v1.route('/health', healthRoutes)
  v1.route('/users', userRoutes)
  v1.route('/auth', authRoutes)
  v1.route('/password', passwordRoutes)
  v1.route('/admins', adminRoutes)
}
