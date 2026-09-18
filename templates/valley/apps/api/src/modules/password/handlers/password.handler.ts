import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  HTTP_STATUS,
  forgetPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '@valley/shared'
import { ServiceError } from '../../../lib/errors.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { errorResponse, successResponse } from '../../../utils/response.ts'
import type { PasswordService } from '../services/password.service.ts'

function handleError(c: Context, error: unknown) {
  if (error instanceof ServiceError) {
    return errorResponse(
      c,
      [{ message: error.message, field: error.field }],
      error.status as ContentfulStatusCode
    )
  }
  throw error
}

export function createPasswordHandlers(
  service: PasswordService,
  getFrontendUrl: () => string
) {
  return {
    update: async (c: Context<AppEnv>) => {
      try {
        const user = c.get('user')
        if (!user) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
        const body = updatePasswordSchema.parse(await c.req.json())
        const result = await service.updatePassword(user.id, body)
        return successResponse(c, result)
      } catch (error) {
        return handleError(c, error)
      }
    },

    forgot: async (c: Context<AppEnv>) => {
      try {
        const body = forgetPasswordSchema.parse(await c.req.json())
        const result = await service.forgotPassword(body, getFrontendUrl())
        return successResponse(c, result)
      } catch (error) {
        return handleError(c, error)
      }
    },

    reset: async (c: Context<AppEnv>) => {
      try {
        const body = resetPasswordSchema.parse(await c.req.json())
        const result = await service.resetPassword(body)
        return successResponse(c, result)
      } catch (error) {
        return handleError(c, error)
      }
    },
  }
}
