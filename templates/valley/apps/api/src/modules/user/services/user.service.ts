import type {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@valley/shared'
import { hashPassword } from '../../../lib/auth.ts'
import { ServiceError } from '../../../lib/errors.ts'
import { userRepository } from '../repositories/user.repository.ts'
import { toUserDto } from '../utils/user.utils.ts'

class UserService {
  async register(input: CreateUserDto): Promise<UserDto> {
    const existingUsername = await userRepository.findByUsername(input.username)
    if (existingUsername) {
      throw new ServiceError('Username already taken', 409, 'username')
    }
    const existingEmail = await userRepository.findByEmail(input.email)
    if (existingEmail) {
      throw new ServiceError('Email already registered', 409, 'email')
    }
    const password = await hashPassword(input.password)
    const user = await userRepository.create({
      username: input.username,
      email: input.email,
      password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    })
    return toUserDto(user)
  }

  async getMe(userId: string): Promise<UserDto> {
    const user = await userRepository.findById(userId)
    if (!user) throw new ServiceError('User not found', 404)
    return toUserDto(user)
  }

  async updateMe(userId: string, input: UpdateUserDto): Promise<UserDto> {
    if (input.username) {
      const other = await userRepository.findByUsername(input.username)
      if (other && other.id !== userId) {
        throw new ServiceError('Username already taken', 409, 'username')
      }
    }
    if (input.email) {
      const other = await userRepository.findByEmail(input.email)
      if (other && other.id !== userId) {
        throw new ServiceError('Email already registered', 409, 'email')
      }
    }
    const data: Parameters<typeof userRepository.update>[1] = {
      username: input.username,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    }
    if (input.password) {
      data.password = await hashPassword(input.password)
    }
    const user = await userRepository.update(userId, data)
    return toUserDto(user)
  }

  async list(page: number, limit: number, q?: string) {
    const { items, total } = await userRepository.list(page, limit, q)
    return { items: items.map(toUserDto), total }
  }

  async getById(id: string): Promise<UserDto> {
    const user = await userRepository.findById(id)
    if (!user) throw new ServiceError('User not found', 404)
    return toUserDto(user)
  }

  async createByAdmin(input: CreateUserDto): Promise<UserDto> {
    return this.register(input)
  }

  async updateByAdmin(id: string, input: UpdateUserDto): Promise<UserDto> {
    const existing = await userRepository.findById(id)
    if (!existing) throw new ServiceError('User not found', 404)
    return this.updateMe(id, input)
  }

  async deleteByAdmin(id: string): Promise<void> {
    const existing = await userRepository.findById(id)
    if (!existing) throw new ServiceError('User not found', 404)
    await userRepository.delete(id)
  }
}

export const userService = new UserService()
