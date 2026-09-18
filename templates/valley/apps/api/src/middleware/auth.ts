import type { Context, Next } from 'hono'
import type { Admin, User } from '@valley/database'
import type { JWTPayload, Role } from '@valley/shared'
import { COOKIE_ACCESS_TOKEN, HTTP_STATUS, MSG_FORBIDDEN, MSG_UNAUTHORIZED } from '@valley/shared'
import { verifyTypedToken } from '../lib/auth.ts'
import { errorResponse } from '../utils/response.ts'

export type AppVariables = {
  jwtSecret: string
  user?: User
  admin?: Admin
  jwt?: JWTPayload
}

export type AppEnv = {
  Variables: AppVariables
}

function extractBearerOrCookie(c: Context<AppEnv>): string | null {
  const header = c.req.header('Authorization')
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim() || null
  }
  const cookieHeader = c.req.header('Cookie')
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';').map((p) => p.trim())
  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const name = part.slice(0, eq)
    if (name === COOKIE_ACCESS_TOKEN) {
      return decodeURIComponent(part.slice(eq + 1))
    }
  }
  return null
}

export type UserLookup = (id: string) => Promise<User | null>
export type AdminLookup = (id: string) => Promise<Admin | null>

export function createAuthMiddleware(lookupUser: UserLookup) {
  return async (c: Context<AppEnv>, next: Next) => {
    const token = extractBearerOrCookie(c)
    if (!token) {
      return errorResponse(c, [{ message: MSG_UNAUTHORIZED }], HTTP_STATUS.UNAUTHORIZED)
    }
    try {
      const secret = c.get('jwtSecret')
      const payload = await verifyTypedToken(token, secret, 'access', 'user')
      const user = await lookupUser(payload.userId)
      if (!user) {
        return errorResponse(c, [{ message: MSG_UNAUTHORIZED }], HTTP_STATUS.UNAUTHORIZED)
      }
      c.set('user', user)
      c.set('jwt', payload)
      await next()
    } catch {
      return errorResponse(c, [{ message: MSG_UNAUTHORIZED }], HTTP_STATUS.UNAUTHORIZED)
    }
  }
}

export function createAdminAuthMiddleware(lookupAdmin: AdminLookup) {
  return async (c: Context<AppEnv>, next: Next) => {
    const header = c.req.header('Authorization')
    const token = header?.startsWith('Bearer ')
      ? header.slice('Bearer '.length).trim()
      : null
    if (!token) {
      return errorResponse(c, [{ message: MSG_UNAUTHORIZED }], HTTP_STATUS.UNAUTHORIZED)
    }
    try {
      const secret = c.get('jwtSecret')
      const payload = await verifyTypedToken(token, secret, 'access', 'admin')
      const admin = await lookupAdmin(payload.userId)
      if (!admin) {
        return errorResponse(c, [{ message: MSG_UNAUTHORIZED }], HTTP_STATUS.UNAUTHORIZED)
      }
      c.set('admin', admin)
      c.set('jwt', payload)
      await next()
    } catch {
      return errorResponse(c, [{ message: MSG_UNAUTHORIZED }], HTTP_STATUS.UNAUTHORIZED)
    }
  }
}

export function requireAdminRole(...roles: Role[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const admin = c.get('admin')
    if (!admin || !roles.includes(admin.role as Role)) {
      return errorResponse(c, [{ message: MSG_FORBIDDEN }], HTTP_STATUS.FORBIDDEN)
    }
    await next()
  }
}
