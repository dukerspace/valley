import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { CreateUserDto, UpdateUserDto } from '@workspace/utils'
import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: data
    })
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id
      }
    })
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email
      }
    })
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        username
      }
    })
  }

  update(userId: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      data: data,
      where: {
        id: userId
      }
    })
  }
}
