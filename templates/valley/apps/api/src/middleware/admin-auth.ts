import type { Context, Next } from 'hono'
import type { Role } from '@valley/shared'
import { HTTP_STATUS, MSG_FORBIDDEN, MSG_UNAUTHORIZED } from '@valley/shared'
import { verifyTypedToken } from '../lib/auth.ts'
import { adminRepository } from '../modules/admin/repositories/admin.repository.ts'
import type { AppEnv } from './auth.ts'
import { errorResponse } from '../utils/response.ts'

export async function adminAuthMiddleware(c: Context<AppEnv>, next: Next) {
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
    const admin = await adminRepository.findById(payload.userId)
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

export function requireAdminRole(...roles: Role[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const admin = c.get('admin')
    if (!admin || !roles.includes(admin.role as Role)) {
      return errorResponse(c, [{ message: MSG_FORBIDDEN }], HTTP_STATUS.FORBIDDEN)
    }
    await next()
  }
}
