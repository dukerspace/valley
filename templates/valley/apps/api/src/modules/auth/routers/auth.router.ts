import { Hono } from 'hono'
import { authUserSchema, refreshTokenSchema } from '@valley/shared'
import type { AppEnv } from '../../../middleware/auth.ts'
import { zValidator } from '../../../utils/validation.ts'
import * as authHandler from '../handlers/auth.handler.ts'

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', zValidator('json', authUserSchema), authHandler.login)
authRoutes.post('/refresh', zValidator('json', refreshTokenSchema), authHandler.refresh)
authRoutes.post('/logout', authHandler.logout)
