import { CreateUserDto, IResponseData, ViewUserDto } from '@workspace/utils'
import { api } from './api'

export const createUser = async (data: CreateUserDto): Promise<IResponseData<ViewUserDto>> => {
  const res: IResponseData<ViewUserDto> = await api().post(`/v1/users`, data)
  return res
}

export const getMe = async (): Promise<IResponseData<ViewUserDto>> => {
  const res: IResponseData<ViewUserDto> = await api().get(`/v1/users/me`)
  return res
}
