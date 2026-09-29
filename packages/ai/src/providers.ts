import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import type { AiProvider } from './types.ts'

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-20250514',
  google: 'gemini-2.0-flash',
  openrouter: 'openai/gpt-4o-mini',
}

export const API_KEY_ENV: Record<AiProvider, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
}

export function resolveDefaultModel(provider: AiProvider, model?: string): string {
  return model?.trim() || DEFAULT_MODELS[provider]
}

export function resolveLanguageModel(options: {
  provider: AiProvider
  apiKey: string
  model: string
  baseURL?: string
}): LanguageModel {
  const { provider, apiKey, model, baseURL } = options

  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey, baseURL }).chat(model)
    case 'anthropic':
      return createAnthropic({ apiKey, baseURL }).chat(model)
    case 'google':
      return createGoogleGenerativeAI({ apiKey, baseURL }).chat(model)
    case 'openrouter':
      return createOpenRouter({ apiKey, baseURL }).chat(model)
  }
}
