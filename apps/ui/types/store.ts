import { IUserInfo } from '@workspace/utils'

export interface IStoreState {
  version: string
  isFirstTime: boolean
  setFirstTime: (status: boolean) => void
  loading: boolean
  setLoading: (status: boolean) => void
  user: IUserInfo | null
  setUser: (data: IUserInfo | null) => void
}
