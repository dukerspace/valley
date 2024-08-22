import { NestFactory } from '@nestjs/core'
import { json, urlencoded } from 'express'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  })
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ extended: true, limit: '50mb' }))
  app.setGlobalPrefix(process.env.API_PREFIX)
  app.enableShutdownHooks()
  await app.listen(process.env.API_PORT)
  console.log('start', process.env.API_PORT, process.env.API_PREFIX)
}
bootstrap()
