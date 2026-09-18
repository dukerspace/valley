import { prisma, type User } from '@valley/database'

export type UserListResult = {
  items: User[]
  total: number
}

export type UserRepository = {
  findById: (id: string) => Promise<User | null>
  findByUsername: (username: string) => Promise<User | null>
  findByEmail: (email: string) => Promise<User | null>
  create: (data: {
    username: string
    email: string
    password: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  }) => Promise<User>
  update: (
    id: string,
    data: Partial<{
      username: string
      email: string
      password: string
      firstName: string | null
      lastName: string | null
      phone: string | null
    }>
  ) => Promise<User>
  delete: (id: string) => Promise<void>
  list: (page: number, limit: number, q?: string) => Promise<UserListResult>
  upsertForgetPassword: (userId: string, token: string, expiresAt: Date) => Promise<void>
  findForgetPassword: (
    email: string,
    token: string
  ) => Promise<{ user: User; expiresAt: Date; id: string } | null>
  deleteForgetPassword: (id: string) => Promise<void>
}

export function createUserRepository(): UserRepository {
  return {
    findById: (id) => prisma.user.findUnique({ where: { id } }),
    findByUsername: (username) => prisma.user.findUnique({ where: { username } }),
    findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
    create: (data) => prisma.user.create({ data }),
    update: (id, data) => prisma.user.update({ where: { id }, data }),
    delete: async (id) => {
      await prisma.user.delete({ where: { id } })
    },
    list: async (page, limit, q) => {
      const where = q
        ? {
            OR: [
              { username: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
              { firstName: { contains: q, mode: 'insensitive' as const } },
              { lastName: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}
      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ])
      return { items, total }
    },
    upsertForgetPassword: async (userId, token, expiresAt) => {
      await prisma.forgetPassword.upsert({
        where: { userId },
        create: { userId, token, expiresAt },
        update: { token, expiresAt },
      })
    },
    findForgetPassword: async (email, token) => {
      const row = await prisma.forgetPassword.findFirst({
        where: { token, user: { email } },
        include: { user: true },
      })
      if (!row) return null
      return { user: row.user, expiresAt: row.expiresAt, id: row.id }
    },
    deleteForgetPassword: async (id) => {
      await prisma.forgetPassword.delete({ where: { id } })
    },
  }
}
