import { parseClientEnv } from '@valley/shared'

export function getApiBaseUrl() {
  const env = parseClientEnv({
    VITE_API_URL: import.meta.env.VITE_API_URL,
  })
  return env.VITE_API_URL.replace(/\/$/, '')
}
