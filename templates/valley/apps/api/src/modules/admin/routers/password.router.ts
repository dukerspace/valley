import { Hono } from 'hono'
import { forgetPasswordSchema, resetPasswordSchema } from '@valley/shared'
import type { AppEnv } from '../../../middleware/auth.ts'
import { zValidator } from '../../../utils/validation.ts'
import * as passwordHandler from '../handlers/password.handler.ts'

export const adminPasswordRoutes = new Hono<AppEnv>()

adminPasswordRoutes.post(
  '/forgot-password',
  zValidator('json', forgetPasswordSchema),
  passwordHandler.forgot
)
adminPasswordRoutes.post(
  '/reset-password',
  zValidator('json', resetPasswordSchema),
  passwordHandler.reset
)
