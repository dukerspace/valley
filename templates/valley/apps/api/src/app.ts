import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { parseCorsOrigins, parseServerEnv } from '@valley/shared'
import { appConfig } from './config/index.ts'
import type { AppEnv } from './middleware/auth.ts'
import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from './middleware/error-handler.ts'
import { registerV1Routes } from './routes/v1-routes.ts'

export function createApp(options?: { env?: NodeJS.ProcessEnv }) {
  const env = parseServerEnv(options?.env ?? process.env)
  const app = new Hono<AppEnv>()
  const v1 = new Hono<AppEnv>()

  app.use(
    '*',
    cors({
      origin: parseCorsOrigins(env.CORS_ORIGIN),
      credentials: true,
    })
  )

  app.use('*', async (c, next) => {
    c.set('jwtSecret', env.JWT_SECRET)
    await next()
  })

  app.use('*', errorHandlerMiddleware)

  registerV1Routes(v1)

  app.route(`${appConfig.API_PREFIX}/${appConfig.API_VERSION}`, v1)

  app.get('/', (c) =>
    c.json({
      name: '@valley/api',
      health: `${appConfig.API_PREFIX}/${appConfig.API_VERSION}/health`,
    })
  )

  app.notFound(notFoundMiddleware)

  return { app, env }
}
