import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthController } from './controllers/auth.controller'
import { AdminService } from './services/admin.service'

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET')

        return {
          secret: secret,
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') }
        }
      }
    })
  ],
  controllers: [AuthController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AuthModule {}
