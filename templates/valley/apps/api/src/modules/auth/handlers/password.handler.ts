import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  HTTP_STATUS,
  type ForgetPasswordDto,
  type ResetPasswordDto,
  type UpdatePasswordDto,
} from '@valley/shared'
import { ServiceError } from '../../../lib/errors.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { errorResponse, successResponse } from '../../../utils/response.ts'
import { passwordService } from '../services/password.service.ts'

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

export async function updatePassword(c: Context<AppEnv>) {
  try {
    const user = c.get('user')
    if (!user) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
    const body = (c.req as any).valid('json') as UpdatePasswordDto
    const result = await passwordService.updatePassword(user.id, body)
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function forgotPassword(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as ForgetPasswordDto
    const result = await passwordService.forgotPassword(body)
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function resetPassword(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as ResetPasswordDto
    const result = await passwordService.resetPassword(body)
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}
