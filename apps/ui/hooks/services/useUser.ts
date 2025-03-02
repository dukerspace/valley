import { createUser, getMe } from '@/services/user'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CreateUserDto, IResponseData, ViewUserDto } from '@valley/utils'

export const useCreateUser = () => {
  return useMutation({
    mutationFn: ({ data }: { data: CreateUserDto }) => createUser(data)
  })
}

export const useGetMe = () => {
  return useQuery<IResponseData<ViewUserDto>>({
    queryKey: ['getMe'],
    queryFn: () => getMe()
  })
}
