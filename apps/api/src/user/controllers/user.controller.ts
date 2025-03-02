import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { hashSync } from 'bcrypt'
import { Response } from 'express'
import { Public } from '../../common/decorators/public.decorator'

import { CreateUserDto, IResponseData, ViewUserDto } from '@valley/utils'
import { IRequestWithUser } from '../../auth/interfaces/user.interface'
import { UserService } from '../services/user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async create(@Res() res: Response, @Body() body: CreateUserDto) {
    const checkUser = await this.userService.findByUsername(body.username)
    if (checkUser) throw new HttpException('Username is exists', HttpStatus.BAD_REQUEST)

    const checkEmail = await this.userService.findByEmail(body.email)
    if (checkEmail) throw new HttpException('Email is exits', HttpStatus.BAD_REQUEST)

    const password = hashSync(body.password, 10)
    const data = {
      ...body,
      password: password
    }
    const query = await this.userService.create(data)
    const { password: _, ...user } = query
    const response: IResponseData<ViewUserDto> = {
      success: true,
      data: user
    }
    res.status(HttpStatus.CREATED).json(response)
  }

  @Get('me')
  async me(@Req() req: IRequestWithUser, @Res() res: Response) {
    console.log('0-00', req.user)
    const userId = req?.user!.id
    const user = await this.userService.findById(userId)
    const { id, username, firstName, lastName, email, mobile, createdAt } = user as ViewUserDto

    const response: IResponseData<ViewUserDto> = {
      success: true,
      data: { id, username, firstName, lastName, email, mobile, createdAt }
    }
    res.status(HttpStatus.OK).json(response)
  }
}
