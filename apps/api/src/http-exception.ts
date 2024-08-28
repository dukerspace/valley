import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { IErrorMessage } from 'dukerspace/utils'

import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    if (process.env.APP_ENV == 'develop') {
      console.log('error', exception)
    }

    const msg = exception.getResponse()
    const err = msg as IErrorMessage

    response.status(status).json({
      success: false,
      message: err.message
    })
  }
}
