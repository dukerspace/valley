import { prisma } from './client.ts'

export { prisma }
export type { PrismaClient } from './client.ts'

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}
