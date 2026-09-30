import type {
  AdminRefreshTokenResponse,
  AuthAdminResponse,
  AdminInfo,
} from '@valley/shared'
import {
  issueTokens,
  verifyPassword,
  verifyTypedToken,
} from '../../../lib/auth.ts'
import { ServiceError } from '../../../lib/errors.ts'
import { authRepository } from '../repositories/auth.repository.ts'
import { toAdminDto } from '../utils/admin.utils.ts'

class AuthService {
  async login(username: string, password: string, jwtSecret: string): Promise<AuthAdminResponse> {
    const admin = await authRepository.findByUsername(username)
    if (!admin || !(await verifyPassword(password, admin.password))) {
      throw new ServiceError('Invalid credentials', 401)
    }
    const tokens = await issueTokens(jwtSecret, {
      userId: admin.id,
      username: admin.username,
      scope: 'admin',
      role: admin.role,
    })
    return { user: toAdminDto(admin), ...tokens }
  }

  async refresh(refreshToken: string, jwtSecret: string): Promise<AdminRefreshTokenResponse> {
    let payload
    try {
      payload = await verifyTypedToken(refreshToken, jwtSecret, 'refresh', 'admin')
    } catch {
      throw new ServiceError('Invalid refresh token', 401)
    }
    const admin = await authRepository.findById(payload.userId)
    if (!admin) throw new ServiceError('Invalid refresh token', 401)
    return issueTokens(jwtSecret, {
      userId: admin.id,
      username: admin.username,
      scope: 'admin',
      role: admin.role,
    })
  }

  async getMe(adminId: string): Promise<AdminInfo> {
    const admin = await authRepository.findById(adminId)
    if (!admin) throw new ServiceError('Admin not found', 404)
    return toAdminDto(admin)
  }
}

export const authService = new AuthService()
