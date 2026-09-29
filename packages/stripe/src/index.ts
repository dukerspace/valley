export type StripeClientConfig = {
  secretKey: string
  webhookSecret?: string
}

export type StripeClient = {
  secretKey: string
  webhookSecret?: string
  /** Stub: construct a real Stripe SDK client in the API layer when needed. */
  ping: () => Promise<'ok'>
}

export function createStripeClient(config: StripeClientConfig): StripeClient {
  if (!config.secretKey) {
    throw new Error('STRIPE_SECRET_KEY is required to create a Stripe client')
  }

  return {
    secretKey: config.secretKey,
    webhookSecret: config.webhookSecret,
    async ping() {
      return 'ok'
    },
  }
}
