import type {
  AuthUserResponseDto,
  UserRefreshTokenResponse,
} from '@valley/shared'
import {
  issueTokens,
  verifyPassword,
  verifyTypedToken,
} from '../../../lib/auth.ts'
import { ServiceError } from '../../../lib/errors.ts'
import { authRepository } from '../repositories/auth.repository.ts'
import { toUserDto } from '../../user/utils/user.utils.ts'

class AuthService {
  async login(
    username: string,
    password: string,
    jwtSecret: string
  ): Promise<AuthUserResponseDto> {
    const user = await authRepository.findByUsername(username)
    if (!user || !(await verifyPassword(password, user.password))) {
      throw new ServiceError('Invalid credentials', 401)
    }
    const tokens = await issueTokens(jwtSecret, {
      userId: user.id,
      username: user.username,
      scope: 'user',
    })
    return {
      user: toUserDto(user),
      ...tokens,
    }
  }

  async refresh(refreshToken: string, jwtSecret: string): Promise<UserRefreshTokenResponse> {
    let payload
    try {
      payload = await verifyTypedToken(refreshToken, jwtSecret, 'refresh', 'user')
    } catch {
      throw new ServiceError('Invalid refresh token', 401)
    }
    const user = await authRepository.findById(payload.userId)
    if (!user) throw new ServiceError('Invalid refresh token', 401)
    return issueTokens(jwtSecret, {
      userId: user.id,
      username: user.username,
      scope: 'user',
    })
  }
}

export const authService = new AuthService()
