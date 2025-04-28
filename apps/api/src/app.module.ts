import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { HeaderResolver, I18nModule } from 'nestjs-i18n'
import { join } from 'path'
import { HttpExceptionFilter } from './common/filters/http-exceptions.filter'
import { AuthGuard } from './common/guards/auth.guard'
import configuration from './config/configuration'
import { AuthModule } from './modules/auth/auth.module'
import { HealthModule } from './modules/health/health.module'
import { UserModule } from './modules/user/user.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('fallbackLanguage'),
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
