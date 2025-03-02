import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      exceptionFactory: (errors) => {
        const msg = errors.map((error) => {
          if (error.constraints) {
            return {
              field: error?.property,
              message: Object.values(error.constraints)
            }
          }
          return error
        })

        return new BadRequestException(msg)
      }
    })
  )
  app.use(cookieParser())
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ extended: true, limit: '50mb' }))
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  })
  app.setGlobalPrefix('api/v1')

  const port = configService.get<number>('API_PORT') || 3001
  await app.listen(port)
}
bootstrap()
