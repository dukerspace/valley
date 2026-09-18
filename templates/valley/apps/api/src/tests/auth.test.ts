import { describe, expect, test } from 'bun:test'
import type { Admin, User } from '@valley/database'
import { createApp } from '../app.ts'
import type { HealthRepository } from '../modules/health/index.ts'
import type { UserRepository } from '../modules/user/index.ts'
import type { AdminRepository } from '../modules/admin/index.ts'

const testEnv = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/valley',
  JWT_SECRET: 'test-jwt-secret-at-least-16-chars',
  API_HOST: '127.0.0.1',
  API_PORT: '3001',
  API_URL: 'http://127.0.0.1:3001',
  FRONTEND_HOST: '127.0.0.1',
  FRONTEND_PORT: '3000',
  FRONTEND_URL: 'http://127.0.0.1:3000',
  BACKOFFICE_HOST: '127.0.0.1',
  BACKOFFICE_PORT: '3002',
  BACKOFFICE_URL: 'http://127.0.0.1:3002',
  CORS_ORIGIN: 'http://127.0.0.1:3000,http://127.0.0.1:3002',
  NODE_ENV: 'test',
} as const

const API = '/api/v1'

function createFakeHealthRepository(): HealthRepository {
  return {
    check: async () => ({ ok: true, version: '16.4' }),
  }
}

function createMemoryUserRepository(): UserRepository {
  const users = new Map<string, User>()
  const forget = new Map<string, { id: string; userId: string; token: string; expiresAt: Date }>()
  let seq = 0

  return {
    findById: async (id) => users.get(id) ?? null,
    findByUsername: async (username) =>
      [...users.values()].find((u) => u.username === username) ?? null,
    findByEmail: async (email) => [...users.values()].find((u) => u.email === email) ?? null,
    create: async (data) => {
      const now = new Date()
      const user: User = {
        id: `user_${++seq}`,
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        phone: data.phone ?? null,
        createdAt: now,
        updatedAt: now,
      }
      users.set(user.id, user)
      return user
    },
    update: async (id, data) => {
      const existing = users.get(id)
      if (!existing) throw new Error('not found')
      const updated = { ...existing, ...data, updatedAt: new Date() }
      users.set(id, updated)
      return updated
    },
    delete: async (id) => {
      users.delete(id)
    },
    list: async (page, limit, q) => {
      let items = [...users.values()]
      if (q) {
        const lower = q.toLowerCase()
        items = items.filter(
          (u) =>
            u.username.toLowerCase().includes(lower) ||
            u.email.toLowerCase().includes(lower)
        )
      }
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      const total = items.length
      return { items: items.slice((page - 1) * limit, page * limit), total }
    },
    upsertForgetPassword: async (userId, token, expiresAt) => {
      forget.set(userId, { id: `fp_${userId}`, userId, token, expiresAt })
    },
    findForgetPassword: async (email, token) => {
      const user = [...users.values()].find((u) => u.email === email)
      if (!user) return null
      const row = forget.get(user.id)
      if (!row || row.token !== token) return null
      return { user, expiresAt: row.expiresAt, id: row.id }
    },
    deleteForgetPassword: async (id) => {
      for (const [key, row] of forget) {
        if (row.id === id) forget.delete(key)
      }
    },
  }
}

function createMemoryAdminRepository(): AdminRepository {
  const admins = new Map<string, Admin>()
  const forget = new Map<string, { id: string; adminId: string; token: string; expiresAt: Date }>()
  let seq = 0

  return {
    count: async () => admins.size,
    findById: async (id) => admins.get(id) ?? null,
    findByUsername: async (username) =>
      [...admins.values()].find((a) => a.username === username) ?? null,
    findByEmail: async (email) => [...admins.values()].find((a) => a.email === email) ?? null,
    create: async (data) => {
      const now = new Date()
      const admin: Admin = {
        id: `admin_${++seq}`,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        createdAt: now,
        updatedAt: now,
      }
      admins.set(admin.id, admin)
      return admin
    },
    update: async (id, data) => {
      const existing = admins.get(id)
      if (!existing) throw new Error('not found')
      const updated = { ...existing, ...data, updatedAt: new Date() }
      admins.set(id, updated)
      return updated
    },
    delete: async (id) => {
      admins.delete(id)
    },
    list: async (page, limit, q) => {
      let items = [...admins.values()]
      if (q) {
        const lower = q.toLowerCase()
        items = items.filter(
          (a) =>
            a.username.toLowerCase().includes(lower) || a.email.toLowerCase().includes(lower)
        )
      }
      const total = items.length
      return { items: items.slice((page - 1) * limit, page * limit), total }
    },
    upsertForgetPassword: async (adminId, token, expiresAt) => {
      forget.set(adminId, { id: `afp_${adminId}`, adminId, token, expiresAt })
    },
    findForgetPassword: async (email, token) => {
      const admin = [...admins.values()].find((a) => a.email === email)
      if (!admin) return null
      const row = forget.get(admin.id)
      if (!row || row.token !== token) return null
      return { admin, expiresAt: row.expiresAt, id: row.id }
    },
    deleteForgetPassword: async (id) => {
      for (const [key, row] of forget) {
        if (row.id === id) forget.delete(key)
      }
    },
  }
}

function createTestApp() {
  return createApp({
    healthRepository: createFakeHealthRepository(),
    userRepository: createMemoryUserRepository(),
    adminRepository: createMemoryAdminRepository(),
    env: testEnv,
  })
}

describe('auth and users', () => {
  test('register and login', async () => {
    const { app } = createTestApp()

    const register = await app.request(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'alice',
        email: 'alice@example.com',
        password: 'password12',
      }),
    })
    expect(register.status).toBe(201)
    const registered = await register.json()
    expect(registered.success).toBe(true)
    expect(registered.data.username).toBe('alice')

    const login = await app.request(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'alice', password: 'password12' }),
    })
    expect(login.status).toBe(200)
    const loggedIn = await login.json()
    expect(loggedIn.data.accessToken).toBeTruthy()
    expect(loggedIn.data.user.email).toBe('alice@example.com')

    const me = await app.request(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${loggedIn.data.accessToken}` },
    })
    expect(me.status).toBe(200)
    expect((await me.json()).data.username).toBe('alice')
  })

  test('protected route returns 401 without token', async () => {
    const { app } = createTestApp()
    const me = await app.request(`${API}/users/me`)
    expect(me.status).toBe(401)
  })

  test('forgot password does not reveal missing emails', async () => {
    const { app } = createTestApp()
    const res = await app.request(`${API}/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'missing@example.com' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.message).toContain('reset link')
  })

  test('password reset happy path', async () => {
    const { app, userRepository } = createTestApp()

    await app.request(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'bob',
        email: 'bob@example.com',
        password: 'password12',
      }),
    })

    await app.request(`${API}/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@example.com' }),
    })

    const user = await userRepository.findByEmail('bob@example.com')
    expect(user).toBeTruthy()
    const token = 'fixed-test-token'
    await userRepository.upsertForgetPassword(
      user!.id,
      token,
      new Date(Date.now() + 60 * 60 * 1000)
    )

    const reset = await app.request(`${API}/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bob@example.com',
        token,
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      }),
    })
    expect(reset.status).toBe(200)

    const login = await app.request(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'bob', password: 'newpass123' }),
    })
    expect(login.status).toBe(200)
  })
})

describe('admin auth and user CRUD', () => {
  test('init super admin and login', async () => {
    const { app } = createTestApp()

    const init = await app.request(`${API}/admins/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'root',
        email: 'root@example.com',
        password: 'password12',
      }),
    })
    expect(init.status).toBe(201)
    const body = await init.json()
    expect(body.data.user.role).toBe('SUPER_ADMIN')
    expect(body.data.accessToken).toBeTruthy()

    const login = await app.request(`${API}/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'root', password: 'password12' }),
    })
    expect(login.status).toBe(200)
  })

  test('paginated user list for admin', async () => {
    const { app } = createTestApp()

    const init = await app.request(`${API}/admins/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'root',
        email: 'root@example.com',
        password: 'password12',
      }),
    })
    const { accessToken } = (await init.json()).data

    await app.request(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'carol',
        email: 'carol@example.com',
        password: 'password12',
      }),
    })

    const list = await app.request(`${API}/admins/users?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(list.status).toBe(200)
    const body = await list.json()
    expect(body.success).toBe(true)
    expect(body.pagination.page).toBe(1)
    expect(body.pagination.total).toBeGreaterThanOrEqual(1)
    expect(Array.isArray(body.data)).toBe(true)
  })
})
