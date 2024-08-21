import { IAdminPayload, IUserPayload } from 'dukerspace/utils'
import { Request } from 'express'

export interface IRequestWithUser extends Request {
  user: IUserPayload
}

export interface IRequestWithAdmin extends Request {
  user: IAdminPayload
}
