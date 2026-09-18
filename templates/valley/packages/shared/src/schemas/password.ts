import { z } from 'zod'

export const forgetPasswordSchema = z.object({
  email: z.string().email(),
})

export type ForgetPasswordDto = z.infer<typeof forgetPasswordSchema>

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    token: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>
