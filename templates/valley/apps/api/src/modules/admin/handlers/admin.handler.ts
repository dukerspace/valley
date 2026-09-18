import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  HTTP_STATUS,
  MSG_CREATE_SUCCESS,
  MSG_DELETE_SUCCESS,
  MSG_UPDATE_SUCCESS,
  authAdminSchema,
  createAdminSchema,
  forgetPasswordSchema,
  idParamSchema,
  initSuperAdminSchema,
  paginationQuerySchema,
  refreshTokenSchema,
  resetPasswordSchema,
  updateAdminSchema,
} from '@valley/shared'
import { ServiceError } from '../../../lib/errors.ts'
import type { AppEnv } from '../../../middleware/auth.ts'
import { errorResponse, paginatedResponse, successResponse } from '../../../utils/response.ts'
import type { AdminService } from '../services/admin.service.ts'

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

export function createAdminHandlers(
  service: AdminService,
  getBackofficeUrl: () => string
) {
  return {
    canInit: async (c: Context<AppEnv>) => {
      return successResponse(c, { canInit: await service.canInit() })
    },

    init: async (c: Context<AppEnv>) => {
      try {
        const body = initSuperAdminSchema.parse(await c.req.json())
        const result = await service.initSuperAdmin(body, c.get('jwtSecret'))
        return successResponse(c, result, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },

    login: async (c: Context<AppEnv>) => {
      try {
        const body = authAdminSchema.parse(await c.req.json())
        const result = await service.login(body.username, body.password, c.get('jwtSecret'))
        return successResponse(c, result)
      } catch (error) {
        return handleError(c, error)
      }
    },

    refresh: async (c: Context<AppEnv>) => {
      try {
        const body = refreshTokenSchema.parse(await c.req.json())
        const result = await service.refresh(body.refreshToken, c.get('jwtSecret'))
        return successResponse(c, result)
      } catch (error) {
        return handleError(c, error)
      }
    },

    me: async (c: Context<AppEnv>) => {
      try {
        const admin = c.get('admin')
        if (!admin) return errorResponse(c, [{ message: 'Unauthorized' }], HTTP_STATUS.UNAUTHORIZED)
        return successResponse(c, await service.getMe(admin.id))
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

    create: async (c: Context<AppEnv>) => {
      try {
        const body = createAdminSchema.parse(await c.req.json())
        const admin = await service.create(body)
        return successResponse(c, admin, HTTP_STATUS.CREATED, MSG_CREATE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },

    update: async (c: Context<AppEnv>) => {
      try {
        const { id } = idParamSchema.parse({ id: c.req.param('id') })
        const body = updateAdminSchema.parse(await c.req.json())
        const admin = await service.update(id, body)
        return successResponse(c, admin, HTTP_STATUS.OK, MSG_UPDATE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },

    remove: async (c: Context<AppEnv>) => {
      try {
        const { id } = idParamSchema.parse({ id: c.req.param('id') })
        await service.delete(id)
        return successResponse(c, null, HTTP_STATUS.OK, MSG_DELETE_SUCCESS)
      } catch (error) {
        return handleError(c, error)
      }
    },

    forgot: async (c: Context<AppEnv>) => {
      try {
        const body = forgetPasswordSchema.parse(await c.req.json())
        const result = await service.forgotPassword(body, getBackofficeUrl())
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
