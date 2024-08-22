import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { join } from 'path'
import { AdminModule } from './admin/admin.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../../../.env'),
      isGlobal: true
    }),
    AdminModule,
    UserModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
