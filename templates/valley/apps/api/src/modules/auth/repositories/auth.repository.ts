import { prisma, type User } from '@valley/database'

class AuthRepository {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } })
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  updatePassword(userId: string, password: string) {
    return prisma.user.update({ where: { id: userId }, data: { password } })
  }

  async upsertForgetPassword(userId: string, token: string, expiresAt: Date) {
    await prisma.forgetPassword.upsert({
      where: { userId },
      create: { userId, token, expiresAt },
      update: { token, expiresAt },
    })
  }

  async findForgetPassword(
    email: string,
    token: string
  ): Promise<{ user: User; expiresAt: Date; id: string } | null> {
    const row = await prisma.forgetPassword.findFirst({
      where: { token, user: { email } },
      include: { user: true },
    })
    if (!row) return null
    return { user: row.user, expiresAt: row.expiresAt, id: row.id }
  }

  async deleteForgetPassword(id: string) {
    await prisma.forgetPassword.delete({ where: { id } })
  }
}

export const authRepository = new AuthRepository()
