import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { parseCorsOrigins, parseServerEnv } from '@valley/shared'
import { appConfig } from './config/index.ts'
import type { AppEnv } from './middleware/auth.ts'
import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from './middleware/error-handler.ts'
import type { AdminRepository } from './modules/admin/index.ts'
import type { HealthRepository } from './modules/health/index.ts'
import type { UserRepository } from './modules/user/index.ts'
import { registerV1Routes } from './routes/v1-routes.ts'

export function createApp(options?: {
  healthRepository?: HealthRepository
  userRepository?: UserRepository
  adminRepository?: AdminRepository
  env?: NodeJS.ProcessEnv
}) {
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

  const { userRepository, adminRepository } = registerV1Routes(v1, {
    healthRepository: options?.healthRepository,
    userRepository: options?.userRepository,
    adminRepository: options?.adminRepository,
    getFrontendUrl: () => env.FRONTEND_URL,
    getBackofficeUrl: () => env.BACKOFFICE_URL,
  })

  app.route(`${appConfig.API_PREFIX}/${appConfig.API_VERSION}`, v1)

  app.get('/', (c) =>
    c.json({
      name: '@valley/api',
      health: `${appConfig.API_PREFIX}/${appConfig.API_VERSION}/health`,
    })
  )

  app.notFound(notFoundMiddleware)

  return { app, env, userRepository, adminRepository }
}
