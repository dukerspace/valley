import { Controller, Res } from '@nestjs/common'

@Controller('auth/password')
export class PasswordController {
  async forgetPassword(@Res() res: Response) {}

  async resetPassword() {}
}
