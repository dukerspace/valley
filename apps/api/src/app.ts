import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { checkDatabaseConnection } from '@starter/database'
import {
  healthResponseSchema,
  parseCorsOrigins,
  parseServerEnv,
  type HealthResponse,
} from '@starter/shared'

export function createApp(options?: {
  checkDatabase?: () => Promise<boolean>
  env?: NodeJS.ProcessEnv
}) {
  const env = parseServerEnv(options?.env ?? process.env)
  const checkDatabase = options?.checkDatabase ?? checkDatabaseConnection
  const app = new Hono()

  app.use(
    '*',
    cors({
      origin: parseCorsOrigins(env.CORS_ORIGIN),
    })
  )

  app.onError((error, c) => {
    console.error('[api]', error instanceof Error ? error.message : 'Unknown error')
    return c.json(
      {
        error: 'internal_error',
        message: 'Unexpected server error',
        statusCode: 500,
      },
      500
    )
  })

  app.get('/health', async (c) => {
    const databaseUp = await checkDatabase()
    const payload: HealthResponse = {
      status: databaseUp ? 'ok' : 'degraded',
      service: 'api',
      database: databaseUp ? 'up' : 'down',
      timestamp: new Date().toISOString(),
      message: databaseUp ? undefined : 'Database connection failed',
    }

    const validated = healthResponseSchema.parse(payload)
    return c.json(validated, databaseUp ? 200 : 503)
  })

  app.get('/', (c) =>
    c.json({
      name: '@starter/api',
      health: '/health',
    })
  )

  return { app, env }
}
