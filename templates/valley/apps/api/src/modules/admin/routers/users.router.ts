import { Hono } from 'hono'
import {
  createUserSchema,
  idParamSchema,
  paginationQuerySchema,
  updateUserSchema,
} from '@valley/shared'
import { adminAuthMiddleware } from '../../../middleware/admin-auth.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { zValidator } from '../../../utils/validation.ts'
import * as userHandler from '../../user/handlers/user.handler.ts'

export const adminUsersRoutes = new Hono<AppEnv>()

adminUsersRoutes.use('*', adminAuthMiddleware)
adminUsersRoutes.get('/', zValidator('query', paginationQuerySchema), userHandler.listUsers)
adminUsersRoutes.post('/', zValidator('json', createUserSchema), userHandler.createUser)
adminUsersRoutes.get('/:id', zValidator('param', idParamSchema), userHandler.getUserById)
adminUsersRoutes.patch(
  '/:id',
  zValidator('param', idParamSchema),
  zValidator('json', updateUserSchema),
  userHandler.updateUser
)
adminUsersRoutes.delete('/:id', zValidator('param', idParamSchema), userHandler.deleteUser)
