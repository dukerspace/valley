import { beforeEach, describe, expect, it, mock } from 'bun:test'

const findByUsernameMock = mock(async () => null)
const findByEmailMock = mock(async () => null)
const createMock = mock(async (data: Record<string, unknown>) => ({
  id: 'user_1',
  username: data.username,
  email: data.email,
  password: data.password,
  firstName: data.firstName ?? null,
  lastName: data.lastName ?? null,
  phone: data.phone ?? null,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

mock.module('../../../../src/modules/user/repositories/user.repository.ts', () => ({
  userRepository: {
    findById: mock(async () => null),
    findByUsername: findByUsernameMock,
    findByEmail: findByEmailMock,
    create: createMock,
    update: mock(async () => null),
    delete: mock(async () => undefined),
    list: mock(async () => ({ items: [], total: 0 })),
  },
}))

mock.module('../../../../src/lib/auth.ts', () => ({
  hashPassword: async () => 'hashed',
}))

const { userService } = await import('../../../../src/modules/user/services/user.service.ts')

describe('UserService.register', () => {
  beforeEach(() => {
    findByUsernameMock.mockClear()
    findByEmailMock.mockClear()
    createMock.mockClear()
  })

  it('creates a user when username and email are free', async () => {
    findByUsernameMock.mockResolvedValueOnce(null)
    findByEmailMock.mockResolvedValueOnce(null)
    const user = await userService.register({
      username: 'alice',
      email: 'a@example.com',
      password: 'password123',
    })
    expect(user.username).toBe('alice')
    expect(user.email).toBe('a@example.com')
    expect(createMock).toHaveBeenCalled()
  })

  it('rejects duplicate username', async () => {
    findByUsernameMock.mockResolvedValueOnce({
      id: 'existing',
      username: 'alice',
      email: 'other@example.com',
      password: 'hashed',
      firstName: null,
      lastName: null,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await expect(
      userService.register({
        username: 'alice',
        email: 'a@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Username already taken')
  })
})
