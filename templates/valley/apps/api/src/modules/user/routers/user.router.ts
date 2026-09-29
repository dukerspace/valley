import { Hono } from 'hono'
import {
  createUserSchema,
  updateUserSchema,
} from '@valley/shared'
import type { AppEnv } from '../../../middleware/auth.ts'
import { authMiddleware } from '../../../middleware/auth.ts'
import { zValidator } from '../../../utils/validation.ts'
import * as userHandler from '../handlers/user.handler.ts'

export const userRoutes = new Hono<AppEnv>()

userRoutes.post('/', zValidator('json', createUserSchema), userHandler.register)
userRoutes.get('/me', authMiddleware, userHandler.me)
userRoutes.patch(
  '/me',
  authMiddleware,
  zValidator('json', updateUserSchema),
  userHandler.updateMe
)
