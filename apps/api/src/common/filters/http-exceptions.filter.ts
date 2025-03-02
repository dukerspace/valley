import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    if (process.env.APP_ENV == 'develop') {
      console.log('error', exception)
    }

    const ctx = host.switchToHttp()

    const httpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let response: unknown

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse()
      response = res['message']
    } else if (exception instanceof HttpException) {
      response = [{ message: [exception.getResponse()] }]
    } else {
      response = exception
    }

    const responseBody = {
      success: false,
      errors: response
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
