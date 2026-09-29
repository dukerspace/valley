export const appConfig = {
  API_PREFIX: '/api',
  API_VERSION: 'v1',
} as const

export function getFrontendUrl(): string {
  return process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://127.0.0.1:3000'
}

export function getBackofficeUrl(): string {
  return process.env.BACKOFFICE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:3002'
}
