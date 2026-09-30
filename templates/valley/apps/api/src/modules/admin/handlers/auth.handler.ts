import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  HTTP_STATUS,
  type AuthAdminDto,
  type RefreshTokenDto,
} from '@valley/shared'
import { ServiceError } from '../../../lib/errors.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { errorResponse, successResponse } from '../../../utils/response.ts'
import { authService } from '../services/auth.service.ts'

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

export async function login(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as AuthAdminDto
    const result = await authService.login(body.username, body.password, c.get('jwtSecret'))
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function refresh(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as RefreshTokenDto
    const result = await authService.refresh(body.refreshToken, c.get('jwtSecret'))
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function me(c: Context<AppEnv>) {
  try {
    const admin = c.get('admin')
    if (!admin) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
    return successResponse(c, await authService.getMe(admin.id))
  } catch (error) {
    return handleError(c, error)
  }
}
