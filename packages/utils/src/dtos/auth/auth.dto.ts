import { IsString } from 'class-validator'

export interface IAuthRequest {
  username: string
  password: string
}

export interface IAuthResponse {
  user: IUserInfo
  accessToken: string
  refreshToken: string
}

export interface IRefreshTokenResponse {
  refreshToken: string
  expiresIn: string | undefined
}

export interface IUserInfo {
  id: string
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  mobile?: string | null
}

export class AuthDTO {
  @IsString()
  username: string

  @IsString()
  password: string
}
