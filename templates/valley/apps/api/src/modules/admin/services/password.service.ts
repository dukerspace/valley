import type { ForgetPasswordDto, ResetPasswordDto } from '@valley/shared'
import { MSG_PASSWORD_RESET_SENT, MSG_PASSWORD_RESET_SUCCESS } from '@valley/shared'
import { getBackofficeUrl } from '../../../config/index.ts'
import {
  createResetToken,
  hashPassword,
  resetExpiresAt,
} from '../../../lib/auth.ts'
import { sendPasswordResetEmail } from '../../../lib/mailer.ts'
import { ServiceError } from '../../../lib/errors.ts'
import { authRepository } from '../repositories/auth.repository.ts'

class PasswordService {
  async forgotPassword(input: ForgetPasswordDto) {
    const admin = await authRepository.findByEmail(input.email)
    if (admin) {
      const token = createResetToken()
      const expiresAt = resetExpiresAt(1)
      await authRepository.upsertForgetPassword(admin.id, token, expiresAt)
      const resetUrl = `${getBackofficeUrl()}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(admin.email)}`
      await sendPasswordResetEmail({ to: admin.email, resetUrl })
    }
    return { message: MSG_PASSWORD_RESET_SENT }
  }

  async resetPassword(input: ResetPasswordDto) {
    const row = await authRepository.findForgetPassword(input.email, input.token)
    if (!row || row.expiresAt.getTime() < Date.now()) {
      throw new ServiceError('Invalid or expired reset token', 400)
    }
    const password = await hashPassword(input.newPassword)
    await authRepository.updatePassword(row.admin.id, password)
    await authRepository.deleteForgetPassword(row.id)
    return { message: MSG_PASSWORD_RESET_SUCCESS }
  }
}

export const passwordService = new PasswordService()
