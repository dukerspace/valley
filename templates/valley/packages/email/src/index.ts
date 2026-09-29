export type EmailClientConfig = {
  apiKey: string
  from: string
}

export type SendEmailInput = {
  to: string
  subject: string
  html: string
}

export type EmailClient = {
  from: string
  sendEmail: (input: SendEmailInput) => Promise<{ id: string }>
}

export function createEmailClient(config: EmailClientConfig): EmailClient {
  if (!config.apiKey) {
    throw new Error('RESEND_API_KEY is required to create an email client')
  }
  if (!config.from) {
    throw new Error('EMAIL_FROM is required to create an email client')
  }

  return {
    from: config.from,
    async sendEmail(input) {
      // Stub — in development, log instead of calling Resend.
      console.log('[email stub]', { from: config.from, ...input })
      return { id: `stub_${Date.now()}` }
    },
  }
}
