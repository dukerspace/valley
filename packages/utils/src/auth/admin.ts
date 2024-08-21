import { IsString } from 'class-validator'

export interface IAuthAdminRequest {
  admin: string
  password: string
}

export interface IAutAdminResponse {
  user: IAdminInfo
  accessToken: string
}

export interface IAdminInfo {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
}

export interface IAdminPayload {
  sub: string
  username: string
}

export class AdminSignIn {
  @IsString()
  admin: string

  @IsString()
  password: string
}
