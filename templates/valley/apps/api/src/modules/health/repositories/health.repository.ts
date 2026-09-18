import { prisma } from '@valley/database'

export type DatabaseHealth = {
  ok: boolean
  version: string | null
}

export type HealthRepository = {
  check: () => Promise<DatabaseHealth>
}

class HealthRepositoryImpl implements HealthRepository {
  async check(): Promise<DatabaseHealth> {
    try {
      const rows = await prisma.$queryRaw<Array<{ version: string }>>`
        SELECT current_setting('server_version') AS version
      `
      const version = rows[0]?.version ?? null
      return { ok: true, version }
    } catch {
      return { ok: false, version: null }
    }
  }
}

export const healthRepository = new HealthRepositoryImpl()
