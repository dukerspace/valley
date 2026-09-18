import type {
  AdminRefreshTokenResponse,
  AuthAdminResponse,
  CreateAdminDto,
  InitSuperAdminDto,
  UpdateAdminDto,
  AdminInfo,
  ForgetPasswordDto,
  ResetPasswordDto,
} from '@valley/shared'
import {
  MSG_PASSWORD_RESET_SENT,
  MSG_PASSWORD_RESET_SUCCESS,
  ROLE,
} from '@valley/shared'
import {
  createResetToken,
  hashPassword,
  issueTokens,
  resetExpiresAt,
  verifyPassword,
  verifyTypedToken,
} from '../../../lib/auth.ts'
import { sendPasswordResetEmail } from '../../../lib/mailer.ts'
import { ServiceError } from '../../../lib/errors.ts'
import type { AdminRepository } from '../repositories/admin.repository.ts'
import { toAdminDto } from '../utils/admin.utils.ts'

export type AdminService = {
  canInit: () => Promise<boolean>
  initSuperAdmin: (input: InitSuperAdminDto, jwtSecret: string) => Promise<AuthAdminResponse>
  login: (username: string, password: string, jwtSecret: string) => Promise<AuthAdminResponse>
  refresh: (refreshToken: string, jwtSecret: string) => Promise<AdminRefreshTokenResponse>
  getMe: (adminId: string) => Promise<AdminInfo>
  list: (
    page: number,
    limit: number,
    q?: string
  ) => Promise<{ items: AdminInfo[]; total: number }>
  create: (input: CreateAdminDto) => Promise<AdminInfo>
  update: (id: string, input: UpdateAdminDto) => Promise<AdminInfo>
  delete: (id: string) => Promise<void>
  forgotPassword: (
    input: ForgetPasswordDto,
    backofficeUrl: string
  ) => Promise<{ message: string }>
  resetPassword: (input: ResetPasswordDto) => Promise<{ message: string }>
  findById: AdminRepository['findById']
}

export function createAdminService(repository: AdminRepository): AdminService {
  return {
    findById: repository.findById,

    async canInit() {
      return (await repository.count()) === 0
    },

    async initSuperAdmin(input, jwtSecret) {
      if ((await repository.count()) > 0) {
        throw new ServiceError('Admin already initialized', 409)
      }
      const password = await hashPassword(input.password)
      const admin = await repository.create({
        username: input.username,
        email: input.email,
        password,
        role: ROLE.SUPER_ADMIN,
        firstName: input.firstName,
        lastName: input.lastName,
      })
      const tokens = await issueTokens(jwtSecret, {
        userId: admin.id,
        username: admin.username,
        scope: 'admin',
        role: admin.role,
      })
      return { user: toAdminDto(admin), ...tokens }
    },

    async login(username, password, jwtSecret) {
      const admin = await repository.findByUsername(username)
      if (!admin || !(await verifyPassword(password, admin.password))) {
        throw new ServiceError('Invalid credentials', 401)
      }
      const tokens = await issueTokens(jwtSecret, {
        userId: admin.id,
        username: admin.username,
        scope: 'admin',
        role: admin.role,
      })
      return { user: toAdminDto(admin), ...tokens }
    },

    async refresh(refreshToken, jwtSecret) {
      let payload
      try {
        payload = await verifyTypedToken(refreshToken, jwtSecret, 'refresh', 'admin')
      } catch {
        throw new ServiceError('Invalid refresh token', 401)
      }
      const admin = await repository.findById(payload.userId)
      if (!admin) throw new ServiceError('Invalid refresh token', 401)
      return issueTokens(jwtSecret, {
        userId: admin.id,
        username: admin.username,
        scope: 'admin',
        role: admin.role,
      })
    },

    async getMe(adminId) {
      const admin = await repository.findById(adminId)
      if (!admin) throw new ServiceError('Admin not found', 404)
      return toAdminDto(admin)
    },

    async list(page, limit, q) {
      const { items, total } = await repository.list(page, limit, q)
      return { items: items.map(toAdminDto), total }
    },

    async create(input) {
      const existingUsername = await repository.findByUsername(input.username)
      if (existingUsername) throw new ServiceError('Username already taken', 409, 'username')
      const existingEmail = await repository.findByEmail(input.email)
      if (existingEmail) throw new ServiceError('Email already registered', 409, 'email')
      const password = await hashPassword(input.password)
      const admin = await repository.create({
        username: input.username,
        email: input.email,
        password,
        role: input.role ?? ROLE.ADMIN,
        firstName: input.firstName,
        lastName: input.lastName,
      })
      return toAdminDto(admin)
    },

    async update(id, input) {
      const existing = await repository.findById(id)
      if (!existing) throw new ServiceError('Admin not found', 404)
      if (input.username) {
        const other = await repository.findByUsername(input.username)
        if (other && other.id !== id) {
          throw new ServiceError('Username already taken', 409, 'username')
        }
      }
      if (input.email) {
        const other = await repository.findByEmail(input.email)
        if (other && other.id !== id) {
          throw new ServiceError('Email already registered', 409, 'email')
        }
      }
      const data: Parameters<AdminRepository['update']>[1] = {
        username: input.username,
        email: input.email,
        role: input.role,
        firstName: input.firstName,
        lastName: input.lastName,
      }
      if (input.password) {
        data.password = await hashPassword(input.password)
      }
      const admin = await repository.update(id, data)
      return toAdminDto(admin)
    },

    async delete(id) {
      const existing = await repository.findById(id)
      if (!existing) throw new ServiceError('Admin not found', 404)
      await repository.delete(id)
    },

    async forgotPassword(input, backofficeUrl) {
      const admin = await repository.findByEmail(input.email)
      if (admin) {
        const token = createResetToken()
        const expiresAt = resetExpiresAt(1)
        await repository.upsertForgetPassword(admin.id, token, expiresAt)
        const resetUrl = `${backofficeUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(admin.email)}`
        await sendPasswordResetEmail({ to: admin.email, resetUrl })
      }
      return { message: MSG_PASSWORD_RESET_SENT }
    },

    async resetPassword(input) {
      const row = await repository.findForgetPassword(input.email, input.token)
      if (!row || row.expiresAt.getTime() < Date.now()) {
        throw new ServiceError('Invalid or expired reset token', 400)
      }
      const password = await hashPassword(input.newPassword)
      await repository.update(row.admin.id, { password })
      await repository.deleteForgetPassword(row.id)
      return { message: MSG_PASSWORD_RESET_SUCCESS }
    },
  }
}
