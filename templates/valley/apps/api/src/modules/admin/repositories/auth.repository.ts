import { prisma, type Admin } from '@valley/database'

class AuthRepository {
  findById(id: string) {
    return prisma.admin.findUnique({ where: { id } })
  }

  findByUsername(username: string) {
    return prisma.admin.findUnique({ where: { username } })
  }

  findByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } })
  }

  updatePassword(adminId: string, password: string) {
    return prisma.admin.update({ where: { id: adminId }, data: { password } })
  }

  async upsertForgetPassword(adminId: string, token: string, expiresAt: Date) {
    await prisma.adminForgetPassword.upsert({
      where: { adminId },
      create: { adminId, token, expiresAt },
      update: { token, expiresAt },
    })
  }

  async findForgetPassword(
    email: string,
    token: string
  ): Promise<{ admin: Admin; expiresAt: Date; id: string } | null> {
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

export const authRepository = new AuthRepository()
