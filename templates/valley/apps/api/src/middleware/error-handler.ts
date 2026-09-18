import type { Context, Next } from 'hono'
import { errorResponse } from '../utils/response.ts'

export async function errorHandlerMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (error) {
    console.error('[api]', error instanceof Error ? error.message : 'Unknown error')
    if (c.req.path.endsWith('/health')) {
      return c.json(
        {
          error: 'internal_error',
          message: 'Unexpected server error',
          statusCode: 500,
        },
        500
      )
    }
    return errorResponse(c, [{ message: 'Unexpected server error' }], 500)
  }
}

export function notFoundMiddleware(c: Context) {
  return errorResponse(
    c,
    [
      {
        field: 'endpoint',
        message: 'Endpoint not found',
      },
    ],
    404
  )
}
