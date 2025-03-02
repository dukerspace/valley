import { IsEmail, IsMobilePhone, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @IsString()
  username: string

  @IsEmail()
  email: string

  @IsString()
  password: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsMobilePhone()
  mobile?: string
}
