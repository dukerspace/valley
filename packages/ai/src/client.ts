import { generateText as sdkGenerateText, streamText as sdkStreamText } from 'ai'
import {
  API_KEY_ENV,
  resolveDefaultModel,
  resolveLanguageModel,
} from './providers.ts'
import {
  AI_PROVIDERS,
  type AiClient,
  type AiClientConfig,
  type AiProvider,
  type GenerateInput,
} from './types.ts'

function assertApiKey(apiKey: string, label: string): void {
  if (!apiKey.trim()) {
    throw new Error(`${label} is required to create an AI client`)
  }
}

function isAiProvider(value: string): value is AiProvider {
  return (AI_PROVIDERS as readonly string[]).includes(value)
}

function buildCallArgs(input: GenerateInput) {
  if (input.messages?.length) {
    return {
      system: input.system,
      messages: input.messages,
    }
  }
  if (input.prompt == null || input.prompt === '') {
    throw new Error('generateText/streamText requires `prompt` or `messages`')
  }
  return {
    system: input.system,
    prompt: input.prompt,
  }
}

export function createAiClient(config: AiClientConfig): AiClient {
  if (!isAiProvider(config.provider)) {
    throw new Error(
      `Unknown AI provider "${String(config.provider)}". Valid: ${AI_PROVIDERS.join(', ')}`
    )
  }

  assertApiKey(config.apiKey, API_KEY_ENV[config.provider])

  const defaultModel = resolveDefaultModel(config.provider, config.model)

  return {
    provider: config.provider,
    model: defaultModel,
    async generateText(input) {
      const modelId = resolveDefaultModel(config.provider, input.model ?? config.model)
      const result = await sdkGenerateText({
        model: resolveLanguageModel({
          provider: config.provider,
          apiKey: config.apiKey,
          model: modelId,
          baseURL: config.baseURL,
        }),
        ...buildCallArgs(input),
      })
      return { text: result.text, model: modelId }
    },
    async streamText(input) {
      const modelId = resolveDefaultModel(config.provider, input.model ?? config.model)
      const result = sdkStreamText({
        model: resolveLanguageModel({
          provider: config.provider,
          apiKey: config.apiKey,
          model: modelId,
          baseURL: config.baseURL,
        }),
        ...buildCallArgs(input),
      })
      return {
        textStream: result.textStream,
        text: result.text,
        model: modelId,
      }
    },
    async complete(prompt) {
      const { text } = await this.generateText({ prompt })
      return text
    },
  }
}

export function createAiClientFromEnv(
  env: Record<string, string | undefined> = process.env
): AiClient {
  const rawProvider = (env.AI_PROVIDER ?? 'openai').trim().toLowerCase()
  if (!isAiProvider(rawProvider)) {
    throw new Error(
      `Unknown AI_PROVIDER "${rawProvider}". Valid: ${AI_PROVIDERS.join(', ')}`
    )
  }

  const keyName = API_KEY_ENV[rawProvider]
  const apiKey = env[keyName] ?? ''
  assertApiKey(apiKey, keyName)

  const model = env.AI_MODEL?.trim() || undefined
  const baseURL = env.AI_BASE_URL?.trim() || undefined

  return createAiClient({
    provider: rawProvider,
    apiKey,
    model,
    baseURL,
  })
}
