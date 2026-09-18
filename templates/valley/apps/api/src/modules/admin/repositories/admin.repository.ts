import { prisma, type Admin } from '@valley/database'
import type { Role } from '@valley/shared'

export type AdminListResult = {
  items: Admin[]
  total: number
}

export type AdminRepository = {
  count: () => Promise<number>
  findById: (id: string) => Promise<Admin | null>
  findByUsername: (username: string) => Promise<Admin | null>
  findByEmail: (email: string) => Promise<Admin | null>
  create: (data: {
    username: string
    email: string
    password: string
    role: Role
    firstName?: string | null
    lastName?: string | null
  }) => Promise<Admin>
  update: (
    id: string,
    data: Partial<{
      username: string
      email: string
      password: string
      role: Role
      firstName: string | null
      lastName: string | null
    }>
  ) => Promise<Admin>
  delete: (id: string) => Promise<void>
  list: (page: number, limit: number, q?: string) => Promise<AdminListResult>
  upsertForgetPassword: (adminId: string, token: string, expiresAt: Date) => Promise<void>
  findForgetPassword: (
    email: string,
    token: string
  ) => Promise<{ admin: Admin; expiresAt: Date; id: string } | null>
  deleteForgetPassword: (id: string) => Promise<void>
}

export function createAdminRepository(): AdminRepository {
  return {
    count: () => prisma.admin.count(),
    findById: (id) => prisma.admin.findUnique({ where: { id } }),
    findByUsername: (username) => prisma.admin.findUnique({ where: { username } }),
    findByEmail: (email) => prisma.admin.findUnique({ where: { email } }),
    create: (data) => prisma.admin.create({ data }),
    update: (id, data) => prisma.admin.update({ where: { id }, data }),
    delete: async (id) => {
      await prisma.admin.delete({ where: { id } })
    },
    list: async (page, limit, q) => {
      const where = q
        ? {
            OR: [
              { username: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}
      const [items, total] = await Promise.all([
        prisma.admin.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.admin.count({ where }),
      ])
      return { items, total }
    },
    upsertForgetPassword: async (adminId, token, expiresAt) => {
      await prisma.adminForgetPassword.upsert({
        where: { adminId },
        create: { adminId, token, expiresAt },
        update: { token, expiresAt },
      })
    },
    findForgetPassword: async (email, token) => {
      const row = await prisma.adminForgetPassword.findFirst({
        where: { token, admin: { email } },
        include: { admin: true },
      })
      if (!row) return null
      return { admin: row.admin, expiresAt: row.expiresAt, id: row.id }
    },
    deleteForgetPassword: async (id) => {
      await prisma.adminForgetPassword.delete({ where: { id } })
    },
  }
}
