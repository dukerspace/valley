import type { IErrorResponse, IResponseData } from '@valley/shared'
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

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<IResponseData<T>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
