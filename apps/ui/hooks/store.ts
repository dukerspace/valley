import { IStoreState } from '@/types'
import { IUserInfo } from '@workspace/utils'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const localStorageName = process.env.STORE_NAME

export const useAppStore = create<IStoreState>()(
  persist(
    (set) => ({
      version: '0.1.0',
      loading: true,
      setLoading: (status: boolean) =>
        set(() => ({
          loading: status
        })),
      isFirstTime: true,
      setFirstTime: (status: boolean) =>
        set(() => ({
          isFirstTime: status
        })),
      user: null,
      setUser: (data: IUserInfo | null) =>
        set(() => ({
          user: data
        }))
    }),
    {
      name: localStorageName!
    }
  )
)
