import { prisma, type User } from '@valley/database'

export type UserListResult = {
  items: User[]
  total: number
}

class UserRepository {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } })
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  create(data: {
    username: string
    email: string
    password: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  }) {
    return prisma.user.create({ data })
  }

  update(
    id: string,
    data: Partial<{
      username: string
      email: string
      password: string
      firstName: string | null
      lastName: string | null
      phone: string | null
    }>
  ) {
    return prisma.user.update({ where: { id }, data })
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } })
  }

  async list(page: number, limit: number, q?: string): Promise<UserListResult> {
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
  }
}

export const userRepository = new UserRepository()
