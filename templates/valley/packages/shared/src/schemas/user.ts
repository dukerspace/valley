import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
})

export type CreateUserDto = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
  phone: z.string().optional().nullable(),
})

export type UpdateUserDto = z.infer<typeof updateUserSchema>

export const adminUpdateUserSchema = updateUserSchema

export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserDto = z.infer<typeof userSchema>

export const authUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export type AuthUserDto = z.infer<typeof authUserSchema>

export const authUserResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type AuthUserResponseDto = z.infer<typeof authUserResponseSchema>

export const userRefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string().optional(),
})

export type UserRefreshTokenResponse = z.infer<typeof userRefreshTokenResponseSchema>
