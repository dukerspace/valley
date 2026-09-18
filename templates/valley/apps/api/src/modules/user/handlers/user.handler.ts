import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  HTTP_STATUS,
  MSG_CREATE_SUCCESS,
  MSG_DELETE_SUCCESS,
  MSG_UPDATE_SUCCESS,
  authUserSchema,
  createUserSchema,
  idParamSchema,
  paginationQuerySchema,
  refreshTokenSchema,
  updateUserSchema,
} from '@valley/shared'
import { ServiceError } from '../../../lib/errors.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { errorResponse, paginatedResponse, successResponse } from '../../../utils/response.ts'
import type { UserService } from '../services/user.service.ts'

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

export function createUserHandlers(service: UserService) {
  return {
    register: async (c: Context<AppEnv>) => {
      try {
        const body = createUserSchema.parse(await c.req.json())
        const user = await service.register(body)
        return successResponse(c, user, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
      } catch (error) {
        if (error instanceof ServiceError) return handleError(c, error)
        if (error && typeof error === 'object' && 'issues' in error) {
          return errorResponse(
            c,
            (error as { issues: Array<{ message: string; path: (string | number)[] }> }).issues.map(
              (i) => ({ message: i.message, field: String(i.path[0] ?? '') })
            ),
            HTTP_STATUS.BAD_REQUEST
          )
        }
        throw error
      }
    },

    login: async (c: Context<AppEnv>) => {
      try {
        const body = authUserSchema.parse(await c.req.json())
        const result = await service.login(body.username, body.password, c.get('jwtSecret'))
        setCookiePair(c, result.accessToken, result.refreshToken)
        return successResponse(c, result)
      } catch (error) {
        return handleError(c, error)
      }
    },

    refresh: async (c: Context<AppEnv>) => {
      try {
        const body = refreshTokenSchema.parse(await c.req.json())
        const result = await service.refresh(body.refreshToken, c.get('jwtSecret'))
        setCookiePair(c, result.accessToken, result.refreshToken)
        return successResponse(c, result)
      } catch (error) {
        return handleError(c, error)
      }
    },

    logout: async (c: Context<AppEnv>) => {
      const secure = process.env.NODE_ENV === 'production'
      const base = `Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}; Max-Age=0`
      c.header('Set-Cookie', `${COOKIE_ACCESS_TOKEN}=; ${base}`, { append: true })
      c.header('Set-Cookie', `${COOKIE_REFRESH_TOKEN}=; ${base}`, { append: true })
      return successResponse(c, { ok: true })
    },

    me: async (c: Context<AppEnv>) => {
      try {
        const user = c.get('user')
        if (!user) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
        return successResponse(c, await service.getMe(user.id))
      } catch (error) {
        return handleError(c, error)
      }
    },

    updateMe: async (c: Context<AppEnv>) => {
      try {
        const user = c.get('user')
        if (!user) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
        const body = updateUserSchema.parse(await c.req.json())
        const updated = await service.updateMe(user.id, body)
        return successResponse(c, updated, HTTP_STATUS.OK, MSG_UPDATE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },

    list: async (c: Context<AppEnv>) => {
      try {
        const query = paginationQuerySchema.parse({
          page: c.req.query('page'),
          limit: c.req.query('limit'),
          q: c.req.query('q'),
        })
        const { items, total } = await service.list(query.page, query.limit, query.q)
        return paginatedResponse(c, items, {
          page: query.page,
          limit: query.limit,
          total,
        })
      } catch (error) {
        return handleError(c, error)
      }
    },

    getById: async (c: Context<AppEnv>) => {
      try {
        const { id } = idParamSchema.parse({ id: c.req.param('id') })
        return successResponse(c, await service.getById(id))
      } catch (error) {
        return handleError(c, error)
      }
    },

    create: async (c: Context<AppEnv>) => {
      try {
        const body = createUserSchema.parse(await c.req.json())
        const user = await service.createByAdmin(body)
        return successResponse(c, user, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },

    update: async (c: Context<AppEnv>) => {
      try {
        const { id } = idParamSchema.parse({ id: c.req.param('id') })
        const body = updateUserSchema.parse(await c.req.json())
        const user = await service.updateByAdmin(id, body)
        return successResponse(c, user, HTTP_STATUS.OK, MSG_UPDATE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },

    remove: async (c: Context<AppEnv>) => {
      try {
        const { id } = idParamSchema.parse({ id: c.req.param('id') })
        await service.deleteByAdmin(id)
        return successResponse(c, null, HTTP_STATUS.OK, MSG_DELETE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },
  }
}

function setCookiePair(c: Context, accessToken: string, refreshToken: string) {
  const secure = process.env.NODE_ENV === 'production'
  const base = `Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
  c.header(
    'Set-Cookie',
    `${COOKIE_ACCESS_TOKEN}=${encodeURIComponent(accessToken)}; ${base}; Max-Age=3600`,
    { append: true }
  )
  c.header(
    'Set-Cookie',
    `${COOKIE_REFRESH_TOKEN}=${encodeURIComponent(refreshToken)}; ${base}; Max-Age=${60 * 60 * 24 * 7}`,
    { append: true }
  )
}
