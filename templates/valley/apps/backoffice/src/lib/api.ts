import {
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_REFRESH_TOKEN_KEY,
  type IErrorResponse,
  type IResponseData,
  type IResponsePaginate,
} from '@valley/shared'
import { getApiBaseUrl } from './env.ts'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: IErrorResponse['errors']
  ) {
    super(message)
  }
}

export function getAdminAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)
}

export function setAdminTokens(accessToken: string, refreshToken: string) {
  window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken)
}

export function clearAdminTokens() {
  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY)
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<IResponseData<T>> {
  const token = getAdminAccessToken()
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  const body = (await response.json().catch(() => null)) as
    | IResponseData<T>
    | IErrorResponse
    | null

  if (!response.ok || (body && 'success' in body && body.success === false)) {
    const errors = body && 'errors' in body ? body.errors : undefined
    const message = errors?.[0]?.message ?? 'Request failed'
    throw new ApiError(message, response.status, errors)
  }

  return body as IResponseData<T>
}

export async function apiPaginated<T>(
  path: string,
  init?: RequestInit
): Promise<IResponsePaginate<T[]>> {
  const token = getAdminAccessToken()
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  const body = (await response.json().catch(() => null)) as
    | IResponsePaginate<T[]>
    | IErrorResponse
    | null

  if (!response.ok || (body && 'success' in body && body.success === false)) {
    const errors = body && 'errors' in body ? body.errors : undefined
    const message = errors?.[0]?.message ?? 'Request failed'
    throw new ApiError(message, response.status, errors)
  }

  return body as IResponsePaginate<T[]>
}
