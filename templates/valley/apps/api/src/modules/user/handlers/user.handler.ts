import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  HTTP_STATUS,
  MSG_CREATE_SUCCESS,
  MSG_DELETE_SUCCESS,
  MSG_UPDATE_SUCCESS,
  type CreateUserDto,
  type IdParam,
  type PaginationQuery,
  type UpdateUserDto,
} from '@valley/shared'
import { ServiceError } from '../../../lib/errors.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { errorResponse, paginatedResponse, successResponse } from '../../../utils/response.ts'
import { userService } from '../services/user.service.ts'

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

export async function register(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as CreateUserDto
    const user = await userService.register(body)
    return successResponse(c, user, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function me(c: Context<AppEnv>) {
  try {
    const user = c.get('user')
    if (!user) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
    return successResponse(c, await userService.getMe(user.id))
  } catch (error) {
    return handleError(c, error)
  }
}

export async function updateMe(c: Context<AppEnv>) {
  try {
    const user = c.get('user')
    if (!user) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
    const body = (c.req as any).valid('json') as UpdateUserDto
    const updated = await userService.updateMe(user.id, body)
    return successResponse(c, updated, HTTP_STATUS.OK, MSG_UPDATE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function listUsers(c: Context<AppEnv>) {
  try {
    const query = (c.req as any).valid('query') as PaginationQuery
    const { items, total } = await userService.list(query.page, query.limit, query.q)
    return paginatedResponse(c, items, {
      page: query.page,
      limit: query.limit,
      total,
    })
  } catch (error) {
    return handleError(c, error)
  }
}

export async function getUserById(c: Context<AppEnv>) {
  try {
    const { id } = (c.req as any).valid('param') as IdParam
    return successResponse(c, await userService.getById(id))
  } catch (error) {
    return handleError(c, error)
  }
}

export async function createUser(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as CreateUserDto
    const user = await userService.createByAdmin(body)
    return successResponse(c, user, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function updateUser(c: Context<AppEnv>) {
  try {
    const { id } = (c.req as any).valid('param') as IdParam
    const body = (c.req as any).valid('json') as UpdateUserDto
    const user = await userService.updateByAdmin(id, body)
    return successResponse(c, user, HTTP_STATUS.OK, MSG_UPDATE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function deleteUser(c: Context<AppEnv>) {
  try {
    const { id } = (c.req as any).valid('param') as IdParam
    await userService.deleteByAdmin(id)
    return successResponse(c, null, HTTP_STATUS.OK, MSG_DELETE_SUCCESS)
  } catch (error) {
    return handleError(c, error)
  }
}
