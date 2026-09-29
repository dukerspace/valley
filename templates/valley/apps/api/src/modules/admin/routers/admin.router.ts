import { Hono } from 'hono'
import {
  authAdminSchema,
  createAdminSchema,
  forgetPasswordSchema,
  idParamSchema,
  initSuperAdminSchema,
  paginationQuerySchema,
  refreshTokenSchema,
  resetPasswordSchema,
  ROLE,
  updateAdminSchema,
} from '@valley/shared'
import { adminAuthMiddleware, requireAdminRole } from '../../../middleware/admin-auth.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { zValidator } from '../../../utils/validation.ts'
import * as adminHandler from '../handlers/admin.handler.ts'

export const adminCoreRoutes = new Hono<AppEnv>()

adminCoreRoutes.get('/init', adminHandler.canInit)
adminCoreRoutes.post(
  '/init',
  zValidator('json', initSuperAdminSchema),
  adminHandler.init
)
adminCoreRoutes.post('/login', zValidator('json', authAdminSchema), adminHandler.login)
adminCoreRoutes.post(
  '/refresh',
  zValidator('json', refreshTokenSchema),
  adminHandler.refresh
)
adminCoreRoutes.post(
  '/forgot-password',
  zValidator('json', forgetPasswordSchema),
  adminHandler.forgot
)
adminCoreRoutes.post(
  '/reset-password',
  zValidator('json', resetPasswordSchema),
  adminHandler.reset
)

adminCoreRoutes.get('/me', adminAuthMiddleware, adminHandler.me)

const superAdmin = requireAdminRole(ROLE.SUPER_ADMIN)

adminCoreRoutes.get(
  '/',
  adminAuthMiddleware,
  superAdmin,
  zValidator('query', paginationQuerySchema),
  adminHandler.list
)
adminCoreRoutes.post(
  '/',
  adminAuthMiddleware,
  superAdmin,
  zValidator('json', createAdminSchema),
  adminHandler.create
)
adminCoreRoutes.patch(
  '/:id',
  adminAuthMiddleware,
  superAdmin,
  zValidator('param', idParamSchema),
  zValidator('json', updateAdminSchema),
  adminHandler.update
)
adminCoreRoutes.delete(
  '/:id',
  adminAuthMiddleware,
  superAdmin,
  zValidator('param', idParamSchema),
  adminHandler.remove
)
