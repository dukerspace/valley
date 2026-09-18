import type {
  AuthUserResponseDto,
  CreateUserDto,
  ForgetPasswordDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UserDto,
} from '@valley/shared'
import { apiRequest } from './api.ts'

const API = '/api/v1'

export function registerUser(input: CreateUserDto) {
  return apiRequest<UserDto>(`${API}/users`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function loginUser(username: string, password: string) {
  return apiRequest<AuthUserResponseDto>(`${API}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function getMe() {
  return apiRequest<UserDto>(`${API}/users/me`)
}

export function updateMe(input: UpdateUserDto) {
  return apiRequest<UserDto>(`${API}/users/me`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function changePassword(input: UpdatePasswordDto) {
  return apiRequest<{ message: string }>(`${API}/password`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function forgotPassword(input: ForgetPasswordDto) {
  return apiRequest<{ message: string }>(`${API}/password/forgot`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function resetPassword(input: ResetPasswordDto) {
  return apiRequest<{ message: string }>(`${API}/password/reset`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function logoutLocal() {
  // Cookies are HttpOnly; clear by overwriting with expired cookies from client is limited.
  // Callers should navigate away; a future /auth/logout can clear server-side cookies.
}
