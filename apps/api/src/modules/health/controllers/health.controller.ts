import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import { Response } from 'express'

interface IHealth {
  message: string
}

@Controller('healthz')
export class HealthController {
  @Get('/')
  health(@Res() res: Response) {
    const response: IHealth = {
      message: 'health is normal'
    }

    res.status(HttpStatus.OK).json(response)
  }
}
