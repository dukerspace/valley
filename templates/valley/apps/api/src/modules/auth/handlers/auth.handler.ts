import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  type AuthUserDto,
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

export async function login(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as AuthUserDto
    const result = await authService.login(body.username, body.password, c.get('jwtSecret'))
    setCookiePair(c, result.accessToken, result.refreshToken)
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function refresh(c: Context<AppEnv>) {
  try {
    const body = (c.req as any).valid('json') as RefreshTokenDto
    const result = await authService.refresh(body.refreshToken, c.get('jwtSecret'))
    setCookiePair(c, result.accessToken, result.refreshToken)
    return successResponse(c, result)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function logout(c: Context<AppEnv>) {
  const secure = process.env.NODE_ENV === 'production'
  const base = `Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}; Max-Age=0`
  c.header('Set-Cookie', `${COOKIE_ACCESS_TOKEN}=; ${base}`, { append: true })
  c.header('Set-Cookie', `${COOKIE_REFRESH_TOKEN}=; ${base}`, { append: true })
  return successResponse(c, { ok: true })
}
