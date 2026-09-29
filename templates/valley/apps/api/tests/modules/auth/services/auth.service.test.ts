import { beforeEach, describe, expect, it, mock } from 'bun:test'

const findByUsernameMock = mock(async () => null)
const findByIdMock = mock(async () => null)

mock.module('../../../../src/modules/auth/repositories/auth.repository.ts', () => ({
  authRepository: {
    findByUsername: findByUsernameMock,
    findById: findByIdMock,
    findByEmail: mock(async () => null),
    updatePassword: mock(async () => undefined),
    upsertForgetPassword: mock(async () => undefined),
    findForgetPassword: mock(async () => null),
    deleteForgetPassword: mock(async () => undefined),
  },
}))

mock.module('../../../../src/lib/auth.ts', () => ({
  verifyPassword: async (password: string, hash: string) =>
    password === 'secret' && hash === 'hashed',
  issueTokens: async () => ({
    accessToken: 'access',
    refreshToken: 'refresh',
  }),
  verifyTypedToken: async () => ({
    userId: 'user_1',
    username: 'alice',
    tokenType: 'refresh',
    scope: 'user',
  }),
  hashPassword: async () => 'hashed',
  createResetToken: () => 'token',
  resetExpiresAt: () => new Date(Date.now() + 3600_000),
}))

const { authService } = await import('../../../../src/modules/auth/services/auth.service.ts')

describe('AuthService.login', () => {
  beforeEach(() => {
    findByUsernameMock.mockClear()
  })

  it('returns user and tokens on valid credentials', async () => {
    findByUsernameMock.mockResolvedValueOnce({
      id: 'user_1',
      username: 'alice',
      email: 'a@example.com',
      password: 'hashed',
      firstName: null,
      lastName: null,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const result = await authService.login('alice', 'secret', 'jwt-secret-at-least-16')
    expect(result.user.username).toBe('alice')
    expect(result.accessToken).toBe('access')
  })

  it('rejects unknown users', async () => {
    findByUsernameMock.mockResolvedValueOnce(null)
    await expect(authService.login('nobody', 'secret', 'jwt-secret-at-least-16')).rejects.toThrow(
      'Invalid credentials'
    )
  })

  it('rejects invalid password', async () => {
    findByUsernameMock.mockResolvedValueOnce({
      id: 'user_1',
      username: 'alice',
      email: 'a@example.com',
      password: 'hashed',
      firstName: null,
      lastName: null,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await expect(authService.login('alice', 'wrong', 'jwt-secret-at-least-16')).rejects.toThrow(
      'Invalid credentials'
    )
  })
})
