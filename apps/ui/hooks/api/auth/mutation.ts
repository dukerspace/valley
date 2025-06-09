import { logIn } from '@/services/auth'
import { useMutation } from '@tanstack/react-query'
import { IAuthRequest } from '@workspace/utils'

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ data }: { data: IAuthRequest }) => logIn(data)
  })
}
