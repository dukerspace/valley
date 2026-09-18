import type {
  ForgetPasswordDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from '@valley/shared'
import {
  MSG_PASSWORD_RESET_SENT,
  MSG_PASSWORD_RESET_SUCCESS,
  MSG_PASSWORD_UPDATED,
} from '@valley/shared'
import {
  createResetToken,
  hashPassword,
  resetExpiresAt,
  verifyPassword,
} from '../../../lib/auth.ts'
import { sendPasswordResetEmail } from '../../../lib/mailer.ts'
import { ServiceError } from '../../../lib/errors.ts'
import type { UserRepository } from '../../user/repositories/user.repository.ts'

export type PasswordService = {
  updatePassword: (userId: string, input: UpdatePasswordDto) => Promise<{ message: string }>
  forgotPassword: (
    input: ForgetPasswordDto,
    frontendUrl: string
  ) => Promise<{ message: string }>
  resetPassword: (input: ResetPasswordDto) => Promise<{ message: string }>
}

export function createPasswordService(repository: UserRepository): PasswordService {
  return {
    async updatePassword(userId, input) {
      const user = await repository.findById(userId)
      if (!user) throw new ServiceError('User not found', 404)
      if (!(await verifyPassword(input.oldPassword, user.password))) {
        throw new ServiceError('Current password is incorrect', 400, 'oldPassword')
      }
      const password = await hashPassword(input.newPassword)
      await repository.update(userId, { password })
      return { message: MSG_PASSWORD_UPDATED }
    },

    async forgotPassword(input, frontendUrl) {
      const user = await repository.findByEmail(input.email)
      if (user) {
        const token = createResetToken()
        const expiresAt = resetExpiresAt(1)
        await repository.upsertForgetPassword(user.id, token, expiresAt)
        const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`
        await sendPasswordResetEmail({ to: user.email, resetUrl })
      }
      return { message: MSG_PASSWORD_RESET_SENT }
    },

    async resetPassword(input) {
      const row = await repository.findForgetPassword(input.email, input.token)
      if (!row || row.expiresAt.getTime() < Date.now()) {
        throw new ServiceError('Invalid or expired reset token', 400)
      }
      const password = await hashPassword(input.newPassword)
      await repository.update(row.user.id, { password })
      await repository.deleteForgetPassword(row.id)
      return { message: MSG_PASSWORD_RESET_SUCCESS }
    },
  }
}
