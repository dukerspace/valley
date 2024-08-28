import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common'
import { AdminSignIn, ERROR_MSG_TYPE, IErrorDto, UserSignIn } from 'dukerspace/utils'
import { Response } from 'express'
import { AuthService } from '../services/auth.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admins')
  async adminSignIn(@Res() res: Response, @Body() body: AdminSignIn) {
    const validate = await this.authService.validateAdmin(body)
    if (!validate) {
      const errors: IErrorDto = {
        message: [
          {
            property: ERROR_MSG_TYPE.SYSTEM,
            message: 'Username or password not match.'
          }
        ],
        success: false
      }

      return res.status(HttpStatus.UNAUTHORIZED).json(errors)
    }

    return res.status(HttpStatus.OK).json({
      data: validate,
      success: true
    })
  }

  @Post('users')
  async userLogin(@Res() res: Response, @Body() body: UserSignIn) {
    const validate = await this.authService.validateUser(body)
    if (!validate) {
      const errors: IErrorDto = {
        message: [
          {
            property: ERROR_MSG_TYPE.SYSTEM,
            message: 'Username or password not match.'
          }
        ],
        success: false
      }

      return res.status(HttpStatus.UNAUTHORIZED).json(errors)
    }

    return res.status(HttpStatus.OK).json({
      data: validate,
      success: true
    })
  }
}
