export type SendPasswordResetEmailInput = {
  to: string
  resetUrl: string
}

/**
 * Dev-friendly mailer: logs the reset URL to stdout.
 * Swap for SMTP later without changing call sites.
 */
export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void> {
  console.info(`[mailer] Password reset for ${input.to}: ${input.resetUrl}`)
}
