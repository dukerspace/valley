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
import { getFrontendUrl } from '../../../config/index.ts'
import {
  createResetToken,
  hashPassword,
  resetExpiresAt,
  verifyPassword,
} from '../../../lib/auth.ts'
import { sendPasswordResetEmail } from '../../../lib/mailer.ts'
import { ServiceError } from '../../../lib/errors.ts'
import { authRepository } from '../repositories/auth.repository.ts'

class PasswordService {
  async updatePassword(userId: string, input: UpdatePasswordDto) {
    const user = await authRepository.findById(userId)
    if (!user) throw new ServiceError('User not found', 404)
    if (!(await verifyPassword(input.oldPassword, user.password))) {
      throw new ServiceError('Current password is incorrect', 400, 'oldPassword')
    }
    const password = await hashPassword(input.newPassword)
    await authRepository.updatePassword(userId, password)
    return { message: MSG_PASSWORD_UPDATED }
  }

  async forgotPassword(input: ForgetPasswordDto) {
    const user = await authRepository.findByEmail(input.email)
    if (user) {
      const token = createResetToken()
      const expiresAt = resetExpiresAt(1)
      await authRepository.upsertForgetPassword(user.id, token, expiresAt)
      const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`
      await sendPasswordResetEmail({ to: user.email, resetUrl })
    }
    return { message: MSG_PASSWORD_RESET_SENT }
  }

  async resetPassword(input: ResetPasswordDto) {
    const row = await authRepository.findForgetPassword(input.email, input.token)
    if (!row || row.expiresAt.getTime() < Date.now()) {
      throw new ServiceError('Invalid or expired reset token', 400)
    }
    const password = await hashPassword(input.newPassword)
    await authRepository.updatePassword(row.user.id, password)
    await authRepository.deleteForgetPassword(row.id)
    return { message: MSG_PASSWORD_RESET_SUCCESS }
  }
}

export const passwordService = new PasswordService()
