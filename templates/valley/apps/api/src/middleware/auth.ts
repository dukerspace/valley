import type { Context, Next } from 'hono'
import type { Admin, User } from '@valley/database'
import type { JWTPayload } from '@valley/shared'
import { COOKIE_ACCESS_TOKEN, HTTP_STATUS, MSG_UNAUTHORIZED } from '@valley/shared'
import { verifyTypedToken } from '../lib/auth.ts'
import { userRepository } from '../modules/user/repositories/user.repository.ts'
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

export function getTokenFromRequest(c: Context<AppEnv>): string | null {
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

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const token = getTokenFromRequest(c)
  if (!token) {
    return errorResponse(c, [{ message: MSG_UNAUTHORIZED }], HTTP_STATUS.UNAUTHORIZED)
  }
  try {
    const secret = c.get('jwtSecret')
    const payload = await verifyTypedToken(token, secret, 'access', 'user')
    const user = await userRepository.findById(payload.userId)
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
