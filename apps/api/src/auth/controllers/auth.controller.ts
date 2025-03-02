import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common'
import {
  AuthDTO,
  ForgetPasswordDto,
  IAuthResponse,
  IResponseData,
  RefreshTokenDto,
  ResetPasswordDto
} from '@valley/utils'
import { Response } from 'express'
import { Public } from '../../common/decorators/public.decorator'
import { IRequestWithUser } from '../interfaces/user.interface'
import { AuthService } from '../services/auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async auth(@Req() req: Request, @Res() res: Response, @Body() body: AuthDTO) {
    const data = await this.authService.validateUser(body)

    const result: IResponseData<IAuthResponse> = {
      success: true,
      data: data
    }
    res.status(HttpStatus.OK).json(result)
  }

  @Public()
  @Post('refresh_token')
  async refreshToken(
    @Req() req: IRequestWithUser,
    @Res() res: Response,
    @Body() body: RefreshTokenDto
  ) {
    const payload = await this.authService.checkRefreshToken(body.refreshToken)
    const data = await this.authService.refreshToken(payload.sub)
    const result: IResponseData<IAuthResponse> = {
      success: true,
      data: data
    }
    res.status(HttpStatus.OK).json(result)
  }

  @Public()
  @Post('password/forget')
  async passwordForget(@Res() res: Response, @Body() body: ForgetPasswordDto) {
    await this.authService.forgetPassword(body)
    const result: IResponseData<string> = {
      success: true,
      message: 'Please check link in your email'
    }
    res.status(HttpStatus.OK).json(result)
  }

  @Public()
  @Post('password/reset')
  async passwordReset(@Res() res: Response, @Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body)
    const result: IResponseData<string> = {
      success: true,
      message: 'Password has changed'
    }
    res.status(HttpStatus.OK).json(result)
  }
}
