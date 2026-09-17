import { z } from 'zod'

export const healthStatusSchema = z.enum(['ok', 'degraded', 'error'])

export const healthResponseSchema = z.object({
  status: healthStatusSchema,
  service: z.literal('api'),
  database: z.enum(['up', 'down']),
  timestamp: z.string().datetime(),
  message: z.string().optional(),
})

export type HealthStatus = z.infer<typeof healthStatusSchema>
export type HealthResponse = z.infer<typeof healthResponseSchema>

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
})

export type ApiError = z.infer<typeof apiErrorSchema>
