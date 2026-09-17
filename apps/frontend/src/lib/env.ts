import { parseClientEnv } from '@starter/shared'

export function getApiBaseUrl() {
  const env = parseClientEnv({
    VITE_API_URL: import.meta.env.VITE_API_URL,
  })
  return env.VITE_API_URL.replace(/\/$/, '')
}
