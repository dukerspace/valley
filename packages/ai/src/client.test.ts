import { afterEach, describe, expect, mock, test } from 'bun:test'

const generateTextMock = mock(async () => ({ text: 'generated' }))
const streamTextMock = mock(() => ({
  textStream: (async function* () {
    yield 'chunk'
  })(),
  text: Promise.resolve('streamed'),
}))

const chatMock = mock((model: string) => ({ kind: 'model', model }))
const createOpenAIMock = mock(() => ({ chat: chatMock }))
const createAnthropicMock = mock(() => ({ chat: chatMock }))
const createGoogleMock = mock(() => ({ chat: chatMock }))
const createOpenRouterMock = mock(() => ({ chat: chatMock }))

mock.module('ai', () => ({
  generateText: generateTextMock,
  streamText: streamTextMock,
}))

mock.module('@ai-sdk/openai', () => ({
  createOpenAI: createOpenAIMock,
}))

mock.module('@ai-sdk/anthropic', () => ({
  createAnthropic: createAnthropicMock,
}))

mock.module('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: createGoogleMock,
}))

mock.module('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: createOpenRouterMock,
}))

const { createAiClient, createAiClientFromEnv } = await import('./client.ts')
const { DEFAULT_MODELS } = await import('./providers.ts')

afterEach(() => {
  generateTextMock.mockClear()
  streamTextMock.mockClear()
  chatMock.mockClear()
  createOpenAIMock.mockClear()
  createAnthropicMock.mockClear()
  createGoogleMock.mockClear()
  createOpenRouterMock.mockClear()
})

describe('createAiClient', () => {
  test('throws when apiKey is missing', () => {
    expect(() =>
      createAiClient({ provider: 'openai', apiKey: '' })
    ).toThrow(/OPENAI_API_KEY/)
  })

  test('generateText uses default model and returns text', async () => {
    const client = createAiClient({ provider: 'openai', apiKey: 'sk-test' })
    expect(client.model).toBe(DEFAULT_MODELS.openai)

    const result = await client.generateText({ prompt: 'hello' })
    expect(result).toEqual({ text: 'generated', model: DEFAULT_MODELS.openai })
    expect(generateTextMock).toHaveBeenCalledTimes(1)
    expect(createOpenAIMock).toHaveBeenCalledWith({
      apiKey: 'sk-test',
      baseURL: undefined,
    })
    expect(chatMock).toHaveBeenCalledWith(DEFAULT_MODELS.openai)
  })

  test('generateText honors per-call model override', async () => {
    const client = createAiClient({
      provider: 'anthropic',
      apiKey: 'sk-ant',
      model: 'claude-default',
    })
    const result = await client.generateText({
      prompt: 'hi',
      model: 'claude-override',
    })
    expect(result.model).toBe('claude-override')
    expect(createAnthropicMock).toHaveBeenCalled()
    expect(chatMock).toHaveBeenCalledWith('claude-override')
  })

  test('streamText returns stream and model', async () => {
    const client = createAiClient({ provider: 'google', apiKey: 'sk-google' })
    const result = await client.streamText({ prompt: 'stream me' })
    expect(result.model).toBe(DEFAULT_MODELS.google)
    expect(await result.text).toBe('streamed')
    expect(createGoogleMock).toHaveBeenCalled()
  })

  test('complete wraps generateText', async () => {
    const client = createAiClient({ provider: 'openrouter', apiKey: 'sk-or' })
    const text = await client.complete('ping')
    expect(text).toBe('generated')
    expect(createOpenRouterMock).toHaveBeenCalled()
  })

  test('rejects empty prompt without messages', async () => {
    const client = createAiClient({ provider: 'openai', apiKey: 'sk-test' })
    await expect(client.generateText({})).rejects.toThrow(/prompt.*messages/)
  })
})

describe('createAiClientFromEnv', () => {
  test('defaults to openai and OPENAI_API_KEY', () => {
    const client = createAiClientFromEnv({ OPENAI_API_KEY: 'sk-env' })
    expect(client.provider).toBe('openai')
    expect(client.model).toBe(DEFAULT_MODELS.openai)
  })

  test('reads AI_PROVIDER, AI_MODEL, AI_BASE_URL, and matching key', async () => {
    const client = createAiClientFromEnv({
      AI_PROVIDER: 'anthropic',
      AI_MODEL: 'claude-env',
      AI_BASE_URL: 'https://example.test',
      ANTHROPIC_API_KEY: 'sk-ant-env',
    })
    expect(client.provider).toBe('anthropic')
    expect(client.model).toBe('claude-env')

    await client.generateText({ prompt: 'x' })
    expect(createAnthropicMock).toHaveBeenCalledWith({
      apiKey: 'sk-ant-env',
      baseURL: 'https://example.test',
    })
  })

  test('throws on unknown AI_PROVIDER', () => {
    expect(() =>
      createAiClientFromEnv({ AI_PROVIDER: 'cohere', OPENAI_API_KEY: 'x' })
    ).toThrow(/Unknown AI_PROVIDER/)
  })

  test('throws when provider key is missing', () => {
    expect(() =>
      createAiClientFromEnv({ AI_PROVIDER: 'google' })
    ).toThrow(/GOOGLE_GENERATIVE_AI_API_KEY/)
  })
})
