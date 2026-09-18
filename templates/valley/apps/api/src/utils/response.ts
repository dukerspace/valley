import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type {
  IErrorMessage,
  IErrorResponse,
  IResponseData,
  IResponsePaginate,
} from '@valley/shared'

export function successResponse<T>(
  c: Context,
  data: T,
  statusCode: ContentfulStatusCode = 200,
  message?: string
) {
  const response: IResponseData<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  }
  return c.json(response, statusCode)
}

export function errorResponse(
  c: Context,
  errors: IErrorMessage[],
  statusCode: ContentfulStatusCode = 400
) {
  const response: IErrorResponse = {
    success: false,
    errors,
  }
  return c.json(response, statusCode)
}

export function paginatedResponse<T>(
  c: Context,
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  }
) {
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 0
  const response: IResponsePaginate<T[]> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  }
  return c.json(response)
}
