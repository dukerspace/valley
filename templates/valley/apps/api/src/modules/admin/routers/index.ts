import { Hono } from 'hono'
import type { AppEnv } from '../../../middleware/auth.ts'
import { adminCoreRoutes } from './admin.router.ts'
import { adminUsersRoutes } from './users.router.ts'

export const adminRoutes = new Hono<AppEnv>()

adminRoutes.route('/users', adminUsersRoutes)
adminRoutes.route('/', adminCoreRoutes)
