import { prisma, type Admin } from '@valley/database'
import type { Role } from '@valley/shared'

export type AdminListResult = {
  items: Admin[]
  total: number
}

class AdminRepository {
  count() {
    return prisma.admin.count()
  }

  findById(id: string) {
    return prisma.admin.findUnique({ where: { id } })
  }

  findByUsername(username: string) {
    return prisma.admin.findUnique({ where: { username } })
  }

  findByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } })
  }

  create(data: {
    username: string
    email: string
    password: string
    role: Role
    firstName?: string | null
    lastName?: string | null
  }) {
    return prisma.admin.create({ data })
  }

  update(
    id: string,
    data: Partial<{
      username: string
      email: string
      password: string
      role: Role
      firstName: string | null
      lastName: string | null
    }>
  ) {
    return prisma.admin.update({ where: { id }, data })
  }

  async delete(id: string) {
    await prisma.admin.delete({ where: { id } })
  }

  async list(page: number, limit: number, q?: string): Promise<AdminListResult> {
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
  }

  async upsertForgetPassword(adminId: string, token: string, expiresAt: Date) {
    await prisma.adminForgetPassword.upsert({
      where: { adminId },
      create: { adminId, token, expiresAt },
      update: { token, expiresAt },
    })
  }

  async findForgetPassword(email: string, token: string) {
    const row = await prisma.adminForgetPassword.findFirst({
      where: { token, admin: { email } },
      include: { admin: true },
    })
    if (!row) return null
    return { admin: row.admin, expiresAt: row.expiresAt, id: row.id }
  }

  async deleteForgetPassword(id: string) {
    await prisma.adminForgetPassword.delete({ where: { id } })
  }
}

export const adminRepository = new AdminRepository()
