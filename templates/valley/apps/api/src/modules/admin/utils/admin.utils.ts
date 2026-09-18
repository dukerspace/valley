import type { Admin } from '@valley/database'
import type { AdminInfo } from '@valley/shared'

export function toAdminDto(admin: Admin): AdminInfo {
  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    firstName: admin.firstName,
    lastName: admin.lastName,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  }
}
