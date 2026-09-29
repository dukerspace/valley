import { z } from 'zod'

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export type IdParam = z.infer<typeof idParamSchema>

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>
