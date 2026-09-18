import type {
  AuthUserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserRefreshTokenResponse,
} from '@valley/shared'
import {
  hashPassword,
  issueTokens,
  verifyPassword,
  verifyTypedToken,
} from '../../../lib/auth.ts'
import { ServiceError } from '../../../lib/errors.ts'
import type { UserRepository } from '../repositories/user.repository.ts'
import { toUserDto } from '../utils/user.utils.ts'

export { ServiceError }

export type UserService = {
  register: (input: CreateUserDto) => Promise<UserDto>
  login: (
    username: string,
    password: string,
    jwtSecret: string
  ) => Promise<AuthUserResponseDto>
  refresh: (refreshToken: string, jwtSecret: string) => Promise<UserRefreshTokenResponse>
  getMe: (userId: string) => Promise<UserDto>
  updateMe: (userId: string, input: UpdateUserDto) => Promise<UserDto>
  list: (
    page: number,
    limit: number,
    q?: string
  ) => Promise<{ items: UserDto[]; total: number }>
  getById: (id: string) => Promise<UserDto>
  createByAdmin: (input: CreateUserDto) => Promise<UserDto>
  updateByAdmin: (id: string, input: UpdateUserDto) => Promise<UserDto>
  deleteByAdmin: (id: string) => Promise<void>
  findById: UserRepository['findById']
}

export function createUserService(repository: UserRepository): UserService {
  return {
    findById: repository.findById,

    async register(input) {
      const existingUsername = await repository.findByUsername(input.username)
      if (existingUsername) {
        throw new ServiceError('Username already taken', 409, 'username')
      }
      const existingEmail = await repository.findByEmail(input.email)
      if (existingEmail) {
        throw new ServiceError('Email already registered', 409, 'email')
      }
      const password = await hashPassword(input.password)
      const user = await repository.create({
        username: input.username,
        email: input.email,
        password,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      })
      return toUserDto(user)
    },

    async login(username, password, jwtSecret) {
      const user = await repository.findByUsername(username)
      if (!user || !(await verifyPassword(password, user.password))) {
        throw new ServiceError('Invalid credentials', 401)
      }
      const tokens = await issueTokens(jwtSecret, {
        userId: user.id,
        username: user.username,
        scope: 'user',
      })
      return {
        user: toUserDto(user),
        ...tokens,
      }
    },

    async refresh(refreshToken, jwtSecret) {
      let payload
      try {
        payload = await verifyTypedToken(refreshToken, jwtSecret, 'refresh', 'user')
      } catch {
        throw new ServiceError('Invalid refresh token', 401)
      }
      const user = await repository.findById(payload.userId)
      if (!user) throw new ServiceError('Invalid refresh token', 401)
      const tokens = await issueTokens(jwtSecret, {
        userId: user.id,
        username: user.username,
        scope: 'user',
      })
      return tokens
    },

    async getMe(userId) {
      const user = await repository.findById(userId)
      if (!user) throw new ServiceError('User not found', 404)
      return toUserDto(user)
    },

    async updateMe(userId, input) {
      if (input.username) {
        const other = await repository.findByUsername(input.username)
        if (other && other.id !== userId) {
          throw new ServiceError('Username already taken', 409, 'username')
        }
      }
      if (input.email) {
        const other = await repository.findByEmail(input.email)
        if (other && other.id !== userId) {
          throw new ServiceError('Email already registered', 409, 'email')
        }
      }
      const data: Parameters<UserRepository['update']>[1] = {
        username: input.username,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      }
      if (input.password) {
        data.password = await hashPassword(input.password)
      }
      const user = await repository.update(userId, data)
      return toUserDto(user)
    },

    async list(page, limit, q) {
      const { items, total } = await repository.list(page, limit, q)
      return { items: items.map(toUserDto), total }
    },

    async getById(id) {
      const user = await repository.findById(id)
      if (!user) throw new ServiceError('User not found', 404)
      return toUserDto(user)
    },

    async createByAdmin(input) {
      return this.register(input)
    },

    async updateByAdmin(id, input) {
      const existing = await repository.findById(id)
      if (!existing) throw new ServiceError('User not found', 404)
      return this.updateMe(id, input)
    },

    async deleteByAdmin(id) {
      const existing = await repository.findById(id)
      if (!existing) throw new ServiceError('User not found', 404)
      await repository.delete(id)
    },
  }
}
