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
import { getBackofficeUrl } from '../../../config/index.ts'
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
import { adminRepository } from '../repositories/admin.repository.ts'
import { toAdminDto } from '../utils/admin.utils.ts'

class AdminService {
  async canInit() {
    return (await adminRepository.count()) === 0
  }

  async initSuperAdmin(input: InitSuperAdminDto, jwtSecret: string): Promise<AuthAdminResponse> {
    if ((await adminRepository.count()) > 0) {
      throw new ServiceError('Admin already initialized', 409)
    }
    const password = await hashPassword(input.password)
    const admin = await adminRepository.create({
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
  }

  async login(username: string, password: string, jwtSecret: string): Promise<AuthAdminResponse> {
    const admin = await adminRepository.findByUsername(username)
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
  }

  async refresh(refreshToken: string, jwtSecret: string): Promise<AdminRefreshTokenResponse> {
    let payload
    try {
      payload = await verifyTypedToken(refreshToken, jwtSecret, 'refresh', 'admin')
    } catch {
      throw new ServiceError('Invalid refresh token', 401)
    }
    const admin = await adminRepository.findById(payload.userId)
    if (!admin) throw new ServiceError('Invalid refresh token', 401)
    return issueTokens(jwtSecret, {
      userId: admin.id,
      username: admin.username,
      scope: 'admin',
      role: admin.role,
    })
  }

  async getMe(adminId: string): Promise<AdminInfo> {
    const admin = await adminRepository.findById(adminId)
    if (!admin) throw new ServiceError('Admin not found', 404)
    return toAdminDto(admin)
  }

  async list(page: number, limit: number, q?: string) {
    const { items, total } = await adminRepository.list(page, limit, q)
    return { items: items.map(toAdminDto), total }
  }

  async create(input: CreateAdminDto): Promise<AdminInfo> {
    const existingUsername = await adminRepository.findByUsername(input.username)
    if (existingUsername) throw new ServiceError('Username already taken', 409, 'username')
    const existingEmail = await adminRepository.findByEmail(input.email)
    if (existingEmail) throw new ServiceError('Email already registered', 409, 'email')
    const password = await hashPassword(input.password)
    const admin = await adminRepository.create({
      username: input.username,
      email: input.email,
      password,
      role: input.role ?? ROLE.ADMIN,
      firstName: input.firstName,
      lastName: input.lastName,
    })
    return toAdminDto(admin)
  }

  async update(id: string, input: UpdateAdminDto): Promise<AdminInfo> {
    const existing = await adminRepository.findById(id)
    if (!existing) throw new ServiceError('Admin not found', 404)
    if (input.username) {
      const other = await adminRepository.findByUsername(input.username)
      if (other && other.id !== id) {
        throw new ServiceError('Username already taken', 409, 'username')
      }
    }
    if (input.email) {
      const other = await adminRepository.findByEmail(input.email)
      if (other && other.id !== id) {
        throw new ServiceError('Email already registered', 409, 'email')
      }
    }
    const data: Parameters<typeof adminRepository.update>[1] = {
      username: input.username,
      email: input.email,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
    }
    if (input.password) {
      data.password = await hashPassword(input.password)
    }
    const admin = await adminRepository.update(id, data)
    return toAdminDto(admin)
  }

  async delete(id: string): Promise<void> {
    const existing = await adminRepository.findById(id)
    if (!existing) throw new ServiceError('Admin not found', 404)
    await adminRepository.delete(id)
  }

  async forgotPassword(input: ForgetPasswordDto) {
    const admin = await adminRepository.findByEmail(input.email)
    if (admin) {
      const token = createResetToken()
      const expiresAt = resetExpiresAt(1)
      await adminRepository.upsertForgetPassword(admin.id, token, expiresAt)
      const resetUrl = `${getBackofficeUrl()}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(admin.email)}`
      await sendPasswordResetEmail({ to: admin.email, resetUrl })
    }
    return { message: MSG_PASSWORD_RESET_SENT }
  }

  async resetPassword(input: ResetPasswordDto) {
    const row = await adminRepository.findForgetPassword(input.email, input.token)
    if (!row || row.expiresAt.getTime() < Date.now()) {
      throw new ServiceError('Invalid or expired reset token', 400)
    }
    const password = await hashPassword(input.newPassword)
    await adminRepository.update(row.admin.id, { password })
    await adminRepository.deleteForgetPassword(row.id)
    return { message: MSG_PASSWORD_RESET_SUCCESS }
  }
}

export const adminService = new AdminService()
