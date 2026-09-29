import { Hono } from 'hono'
import {
  forgetPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '@valley/shared'
import type { AppEnv } from '../../../middleware/auth.ts'
import { authMiddleware } from '../../../middleware/auth.ts'
import { zValidator } from '../../../utils/validation.ts'
import * as passwordHandler from '../handlers/password.handler.ts'

export const passwordRoutes = new Hono<AppEnv>()

passwordRoutes.put(
  '/',
  authMiddleware,
  zValidator('json', updatePasswordSchema),
  passwordHandler.updatePassword
)
passwordRoutes.post(
  '/forgot',
  zValidator('json', forgetPasswordSchema),
  passwordHandler.forgotPassword
)
passwordRoutes.post(
  '/reset',
  zValidator('json', resetPasswordSchema),
  passwordHandler.resetPassword
)
