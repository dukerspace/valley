import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

import { IRequestWithUser } from 'src/auth/interfaces/user.interface'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<IRequestWithUser>()
    const token = this.extractTokenFromHeader(request)

    if (!token) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; username: string }>(token)

      request['user'] = {
        id: payload.sub,
        username: payload.username
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNAUTHORIZED)
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
