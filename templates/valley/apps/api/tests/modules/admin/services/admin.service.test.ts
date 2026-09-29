import { beforeEach, describe, expect, it, mock } from 'bun:test'

const countMock = mock(async () => 0)
const findByUsernameMock = mock(async () => null)
const createMock = mock(async (data: Record<string, unknown>) => ({
  id: 'admin_1',
  username: data.username,
  email: data.email,
  password: data.password,
  role: data.role,
  firstName: data.firstName ?? null,
  lastName: data.lastName ?? null,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

mock.module('../../../../src/modules/admin/repositories/admin.repository.ts', () => ({
  adminRepository: {
    count: countMock,
    findById: mock(async () => null),
    findByUsername: findByUsernameMock,
    findByEmail: mock(async () => null),
    create: createMock,
    update: mock(async () => null),
    delete: mock(async () => undefined),
    list: mock(async () => ({ items: [], total: 0 })),
    upsertForgetPassword: mock(async () => undefined),
    findForgetPassword: mock(async () => null),
    deleteForgetPassword: mock(async () => undefined),
  },
}))

mock.module('../../../../src/lib/auth.ts', () => ({
  hashPassword: async () => 'hashed',
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
  createResetToken: () => 'token',
  resetExpiresAt: () => new Date(Date.now() + 3600_000),
}))

mock.module('../../../../src/lib/mailer.ts', () => ({
  sendPasswordResetEmail: mock(async () => undefined),
}))

const { adminService } = await import('../../../../src/modules/admin/services/admin.service.ts')

describe('AdminService', () => {
  beforeEach(() => {
    countMock.mockClear()
    findByUsernameMock.mockClear()
    createMock.mockClear()
  })

  it('canInit is true when no admins exist', async () => {
    countMock.mockResolvedValueOnce(0)
    expect(await adminService.canInit()).toBe(true)
  })

  it('initSuperAdmin creates the first admin', async () => {
    countMock.mockResolvedValueOnce(0)
    const result = await adminService.initSuperAdmin(
      {
        username: 'root',
        email: 'root@example.com',
        password: 'password123',
      },
      'jwt-secret-at-least-16'
    )
    expect(result.user.username).toBe('root')
    expect(result.accessToken).toBe('access')
  })

  it('login succeeds with valid credentials', async () => {
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
    const result = await adminService.login('root', 'secret', 'jwt-secret-at-least-16')
    expect(result.user.username).toBe('root')
  })

  it('login rejects invalid credentials', async () => {
    findByUsernameMock.mockResolvedValueOnce(null)
    await expect(adminService.login('root', 'secret', 'jwt-secret-at-least-16')).rejects.toThrow(
      'Invalid credentials'
    )
  })
})
