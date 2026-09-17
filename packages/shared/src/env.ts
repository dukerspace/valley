import { z } from 'zod'

const portSchema = z.coerce.number().int().min(1).max(65535)

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  API_HOST: z.string().min(1).default('127.0.0.1'),
  API_PORT: portSchema.default(3001),
  API_URL: z.string().url().default('http://127.0.0.1:3001'),
  FRONTEND_HOST: z.string().min(1).default('127.0.0.1'),
  FRONTEND_PORT: portSchema.default(3000),
  FRONTEND_URL: z.string().url().default('http://127.0.0.1:3000'),
  CORS_ORIGIN: z.string().min(1).default('http://127.0.0.1:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export const clientEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://127.0.0.1:3001'),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>

export function parseServerEnv(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>
): ServerEnv {
  return serverEnvSchema.parse(env)
}

export function parseClientEnv(env: Record<string, string | undefined>): ClientEnv {
  return clientEnvSchema.parse(env)
}

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}
