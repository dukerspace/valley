import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { HeaderResolver, I18nModule } from 'nestjs-i18n'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { HttpExceptionFilter } from './common/filters/http-exceptions.filter'
import { AuthGuard } from './common/guards/auth.guard'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('fallback_language'),
        fallbacks: {
          th: 'th',
          en: 'en'
        },
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          watch: true
        }
      }),
      resolvers: [new HeaderResolver(['x-lang'])],
      inject: [ConfigService]
    }),
    PrismaModule,
    HealthModule,
    UserModule,
    AuthModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {}
