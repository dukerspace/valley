import { IsString } from 'class-validator'

export interface IAuthUserRequest {
  username: string
  password: string
}

export interface IAutUserResponse {
  user: IUserInfo
  accessToken: string
}

export interface IUserInfo {
  id: string
  username: string
  email: string
  mobile?: string
  firstName: string
  lastName: string
}

export interface IUserPayload {
  sub: string
  username: string
}

export class UserSignIn {
  @IsString()
  username: string

  @IsString()
  password: string
}
