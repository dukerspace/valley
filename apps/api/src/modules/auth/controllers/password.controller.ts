import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common'
import { ForgetPasswordDto, IResponseData, ResetPasswordDto } from '@workspace/utils'
import { Response } from 'express'
import { Public } from '../../../common/decorators/public.decorator'
import { AuthService } from '../services/auth.service'

@Controller('password')
export class PasswordController {
  constructor(private readonly authService: AuthService) {}

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
