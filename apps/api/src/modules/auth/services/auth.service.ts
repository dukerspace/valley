import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthDTO, ForgetPasswordDto, IAuthResponse, ResetPasswordDto } from '@workspace/utils'
import { compare, hashSync } from 'bcrypt'
import { nanoid } from 'nanoid'
import { I18nService } from 'nestjs-i18n'
import { PrismaService } from '../../../prisma/prisma.service'
import { IToken } from '../interfaces/token.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly i18n: I18nService
  ) {}

  async validateUser(auth: AuthDTO): Promise<IAuthResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: auth.username
      }
    })
    if (!user) throw new HttpException(this.i18n.t('error.user_not_found'), HttpStatus.BAD_REQUEST)

    const match = await compare(auth.password, user.password)
    if (!match) throw new HttpException('Password incorrect', HttpStatus.BAD_REQUEST)

    if (user && match) {
      const { id, username, firstName, lastName, email, mobile } = user

      const payload: IToken = { username: username, sub: user.id, id: user.id }
      const token = await this.generateAccessToken(payload)
      const refreshToken = await this.generateRefreshToken(payload)

      return {
        user: {
          id,
          username,
          firstName,
          lastName,
          email,
          mobile
        },
        accessToken: token,
        refreshToken: refreshToken
      }
    } else {
      throw new Error('Error')
    }
  }

  // @todo email service
  async forgetPassword(data: ForgetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email
      }
    })

    if (!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST)

    const forgot = await this.prisma.forgetPassword.findFirst({
      where: {
        userId: user.id
      }
    })

    const token = nanoid(30)
    if (!forgot) {
      const data = {
        userId: user.id,
        token: token
      }
      await this.prisma.forgetPassword.create({
        data: data
      })
    } else {
      await this.prisma.forgetPassword.update({
        where: {
          id: forgot.id
        },
        data: {
          token: token
        }
      })
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email
      }
    })

    if (!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST)

    const reset = await this.prisma.forgetPassword.findFirst({
      where: {
        userId: user.id,
        token: data.token
      }
    })

    if (!reset) throw new HttpException('Token not found', HttpStatus.BAD_REQUEST)

    if (data.newPassword != data.confirmPassword)
      throw new HttpException('Password not match', HttpStatus.BAD_REQUEST)

    const password = hashSync(data.newPassword, 10)
    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: password
      }
    })

    await this.prisma.forgetPassword.delete({
      where: {
        id: reset.id
      }
    })
  }

  async checkRefreshToken(token: string) {
    const payload = await this.jwtService.verifyAsync<{ sub: string; username: string }>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')
    })
    return payload
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    })
    if (!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST)

    const { id, username, firstName, lastName, email, mobile } = user

    const payload: IToken = { username: username, sub: id, id: id }
    const token = await this.generateAccessToken(payload)
    const refreshToken = await this.generateRefreshToken(payload)

    return {
      user: {
        id,
        username,
        firstName,
        lastName,
        email,
        mobile
      },
      accessToken: token,
      refreshToken: refreshToken
    }
  }

  generateAccessToken(data: IToken) {
    return this.jwtService.signAsync(data)
  }

  generateRefreshToken(data: IToken) {
    return this.jwtService.signAsync(data, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')
    })
  }
}
