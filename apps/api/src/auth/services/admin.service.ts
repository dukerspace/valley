import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcrypt'
import {
  IAdminPayload,
  IAutAdminResponse,
  IAuthAdminRequest,
  IAuthUserRequest,
  IAutUserResponse,
  IUserPayload
} from 'dukerspace/utils'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async validateAdmin(auth: IAuthAdminRequest): Promise<IAutAdminResponse> {
    const admin = await this.prisma.admin.findFirst({
      where: {
        username: auth.admin
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true
      }
    })
    if (!admin) throw new Error('Admin not found.')

    const match = await compare(auth.password, admin.password)

    if (!match) throw new Error('Password incorrect.')

    if (admin && match) {
      const payload: IAdminPayload = { username: admin.username, sub: admin.id }

      const token = await this.jwtService.sign(payload)

      const res: IAutAdminResponse = {
        user: {
          id: admin.id,
          email: admin.email,
          username: admin.username,
          firstName: admin.firstName,
          lastName: admin.lastName
        },
        accessToken: token
      }
      return res
    }
  }

  async validateUser(auth: IAuthUserRequest): Promise<IAutUserResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: auth.username
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true
      }
    })
    if (!user) throw new Error('User not found.')

    const match = await compare(auth.password, user.password)
    if (!match) throw new Error('Password incorrect.')

    if (user && match) {
      const payload: IUserPayload = { username: user.username, sub: user.id }

      const token = await this.jwtService.sign(payload)

      const res: IAutUserResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        },
        accessToken: token
      }
      return res
    }
  }

  async findById(id: string) {
    return this.prisma.admin.findFirst({
      where: {
        id: id
      }
    })
  }

  async findByAuth(id: string, username: string) {
    return this.prisma.admin.findFirst({
      where: {
        id: id,
        username: username
      }
    })
  }
}
