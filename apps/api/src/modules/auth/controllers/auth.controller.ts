import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { AuthDTO, IAuthResponse, IResponseData, RefreshTokenDto } from '@workspace/utils'
import { Response } from 'express'
import { Public } from '../../../common/decorators/public.decorator'
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
}
