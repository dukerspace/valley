import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  HTTP_STATUS,
  MSG_CREATE_SUCCESS,
  MSG_DELETE_SUCCESS,
  MSG_UPDATE_SUCCESS,
  type AuthAdminDto,
  type CreateAdminDto,
  type ForgetPasswordDto,
  type IdParam,
  type InitSuperAdminDto,
  type PaginationQuery,
  type RefreshTokenDto,
  type ResetPasswordDto,
  type UpdateAdminDto,
} from '@valley/shared'
import { ServiceError } from '../../../lib/errors.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { errorResponse, paginatedResponse, successResponse } from '../../../utils/response.ts'
import { adminService } from '../services/admin.service.ts'

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

export async function canInit(c: Context<AppEnv>) {
  return successResponse(c, { canInit: await adminService.canInit() })
}

export async function init(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as InitSuperAdminDto
    const result = await adminService.initSuperAdmin(body, c.get('jwtSecret'))
    return successResponse(c, result, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function login(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as AuthAdminDto
    const result = await adminService.login(body.username, body.password, c.get('jwtSecret'))
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function refresh(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as RefreshTokenDto
    const result = await adminService.refresh(body.refreshToken, c.get('jwtSecret'))
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function me(c: Context<AppEnv>) {
  try {
    const admin = c.get('admin')
    if (!admin) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
    return successResponse(c, await adminService.getMe(admin.id))
  } catch (error) {
    return handleError(c, error)
  }
}

export async function list(c: Context<AppEnv>) {
  try {
    const query = (c.req as any).valid('query') as PaginationQuery
    const { items, total } = await adminService.list(query.page, query.limit, query.q)
    return paginatedResponse(c, items, {
      page: query.page,
      limit: query.limit,
      total,
    })
  } catch (error) {
    return handleError(c, error)
  }
}

export async function create(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as CreateAdminDto
    const admin = await adminService.create(body)
    return successResponse(c, admin, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function update(c: Context<AppEnv>) {
  try {
    const { id } = (c.req as any).valid('param') as IdParam
    const body = (c.req as any).valid('json') as UpdateAdminDto
    const admin = await adminService.update(id, body)
    return successResponse(c, admin, HTTP_STATUS.OK, MSG_UPDATE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function remove(c: Context<AppEnv>) {
  try {
    const { id } = (c.req as any).valid('param') as IdParam
    await adminService.delete(id)
    return successResponse(c, null, HTTP_STATUS.OK, MSG_DELETE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function forgot(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as ForgetPasswordDto
    const result = await adminService.forgotPassword(body)
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function reset(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as ResetPasswordDto
    const result = await adminService.resetPassword(body)
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}
