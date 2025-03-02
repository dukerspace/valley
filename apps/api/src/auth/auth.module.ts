import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './constants'
import { AuthService } from './services/auth.service'

import { PrismaModule } from 'src/prisma/prisma.module'
import { AuthGuard } from '../common/guards/auth.guard'
import { AuthController } from './controllers/auth.controller'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secretOrKeyProvider: () => jwtConstants.secret!,
      signOptions: {
        expiresIn: '60s',
        algorithm: 'HS384'
      },
      verifyOptions: {
        algorithms: ['HS384']
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService]
})
export class AuthModule {}
