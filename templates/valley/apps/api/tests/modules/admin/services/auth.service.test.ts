import { beforeEach, describe, expect, it, mock } from 'bun:test'

const findByUsernameMock = mock(async () => null)
const findByIdMock = mock(async () => null)

mock.module('../../../../src/modules/admin/repositories/auth.repository.ts', () => ({
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
    userId: 'admin_1',
    username: 'root',
    tokenType: 'refresh',
    scope: 'admin',
  }),
  hashPassword: async () => 'hashed',
  createResetToken: () => 'token',
  resetExpiresAt: () => new Date(Date.now() + 3600_000),
}))

const { authService } = await import('../../../../src/modules/admin/services/auth.service.ts')

describe('Admin AuthService.login', () => {
  beforeEach(() => {
    findByUsernameMock.mockClear()
  })

  it('returns admin and tokens on valid credentials', async () => {
    findByUsernameMock.mockResolvedValueOnce({
      id: 'admin_1',
      username: 'root',
      email: 'root@example.com',
      password: 'hashed',
      role: 'SUPER_ADMIN',
      firstName: null,
      lastName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const result = await authService.login('root', 'secret', 'jwt-secret-at-least-16')
    expect(result.user.username).toBe('root')
    expect(result.accessToken).toBe('access')
  })

  it('rejects invalid credentials', async () => {
    findByUsernameMock.mockResolvedValueOnce(null)
    await expect(authService.login('root', 'secret', 'jwt-secret-at-least-16')).rejects.toThrow(
      'Invalid credentials'
    )
  })
})
