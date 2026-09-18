import { z } from 'zod'
import { ROLE } from '../utils/role.ts'

export const adminRoleSchema = z.enum([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.MODERATOR])
export type AdminRole = z.infer<typeof adminRoleSchema>

export const authAdminSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export type AuthAdminDto = z.infer<typeof authAdminSchema>

export const adminInfoSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: adminRoleSchema,
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AdminInfo = z.infer<typeof adminInfoSchema>

export const authAdminResponseSchema = z.object({
  user: adminInfoSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type AuthAdminResponse = z.infer<typeof authAdminResponseSchema>

export const createAdminSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: adminRoleSchema.optional(),
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
})

export type CreateAdminDto = z.infer<typeof createAdminSchema>

export const updateAdminSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: adminRoleSchema.optional(),
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
})

export type UpdateAdminDto = z.infer<typeof updateAdminSchema>

export const initSuperAdminSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
})

export type InitSuperAdminDto = z.infer<typeof initSuperAdminSchema>

export const adminRefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string().optional(),
})

export type AdminRefreshTokenResponse = z.infer<typeof adminRefreshTokenResponseSchema>
