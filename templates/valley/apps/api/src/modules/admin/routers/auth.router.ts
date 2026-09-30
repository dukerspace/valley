import { Hono } from 'hono'
import { authAdminSchema, refreshTokenSchema } from '@valley/shared'
import { adminAuthMiddleware } from '../../../middleware/admin-auth.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { zValidator } from '../../../utils/validation.ts'
import * as authHandler from '../handlers/auth.handler.ts'

export const adminAuthRoutes = new Hono<AppEnv>()

adminAuthRoutes.post('/login', zValidator('json', authAdminSchema), authHandler.login)
adminAuthRoutes.post(
  '/refresh',
  zValidator('json', refreshTokenSchema),
  authHandler.refresh
)
adminAuthRoutes.get('/me', adminAuthMiddleware, authHandler.me)
