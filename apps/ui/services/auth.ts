import { IAuthRequest, IAuthResponse, IResponseData } from '@valley/utils'
import { api } from './api'

export const logIn = async (data: IAuthRequest): Promise<IResponseData<IAuthResponse>> => {
  const res: IResponseData<IAuthResponse> = await api().post(`/v1/auth/login`, data)
  return res
}
