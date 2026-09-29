export const AI_PROVIDERS = ['openai', 'anthropic', 'google', 'openrouter'] as const

export type AiProvider = (typeof AI_PROVIDERS)[number]

export type AiClientConfig = {
  provider: AiProvider
  apiKey: string
  /** Default model when a call omits `model`. */
  model?: string
  /** Optional override (useful for OpenRouter / proxies). */
  baseURL?: string
}

export type AiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type GenerateInput = {
  prompt?: string
  system?: string
  messages?: AiMessage[]
  /** Per-call model override. */
  model?: string
}

export type GenerateResult = {
  text: string
  model: string
}

export type StreamResult = {
  textStream: AsyncIterable<string>
  text: PromiseLike<string>
  model: string
}

export type AiClient = {
  provider: AiProvider
  model: string
  generateText: (input: GenerateInput) => Promise<GenerateResult>
  streamText: (input: GenerateInput) => Promise<StreamResult>
  complete: (prompt: string) => Promise<string>
}
