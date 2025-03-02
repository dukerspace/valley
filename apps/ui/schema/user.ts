import z from 'zod'

export const createUserSchema = z.object({
  username: z.string(),
  password: z.string().min(6, { message: 'errors.passwordMin' }),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  mobile: z.string().optional()
})

export type User = z.infer<typeof createUserSchema>
