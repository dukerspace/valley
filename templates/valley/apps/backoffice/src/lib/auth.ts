import type {
  AuthAdminResponse,
  CreateUserDto,
  ForgetPasswordDto,
  InitSuperAdminDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserDto,
} from '@valley/shared'
import { apiPaginated, apiRequest, clearAdminTokens, setAdminTokens } from './api.ts'

const API = '/api/v1'

export async function checkCanInit() {
  return apiRequest<{ canInit: boolean }>(`${API}/admins/init`)
}

export async function initSuperAdmin(input: InitSuperAdminDto) {
  const res = await apiRequest<AuthAdminResponse>(`${API}/admins/init`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (res.data) setAdminTokens(res.data.accessToken, res.data.refreshToken)
  return res
}

export async function loginAdmin(username: string, password: string) {
  const res = await apiRequest<AuthAdminResponse>(`${API}/admins/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (res.data) setAdminTokens(res.data.accessToken, res.data.refreshToken)
  return res
}

export function logoutAdmin() {
  clearAdminTokens()
}

export function forgotAdminPassword(input: ForgetPasswordDto) {
  return apiRequest<{ message: string }>(`${API}/admins/forgot-password`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function resetAdminPassword(input: ResetPasswordDto) {
  return apiRequest<{ message: string }>(`${API}/admins/reset-password`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function listUsers(page: number, limit: number, q?: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (q) params.set('q', q)
  return apiPaginated<UserDto>(`${API}/admins/users?${params.toString()}`)
}

export function createUser(input: CreateUserDto) {
  return apiRequest<UserDto>(`${API}/admins/users`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateUser(id: string, input: UpdateUserDto) {
  return apiRequest<UserDto>(`${API}/admins/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: string) {
  return apiRequest<null>(`${API}/admins/users/${id}`, { method: 'DELETE' })
}
