import type { User } from '@valley/database'
import type { UserDto } from '@valley/shared'

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
