// src/providers/counter-store-provider.tsx
'use client'

import { Loader } from '@/components/loading/Loading'
import { IStoreState } from '@/types'
import { type ReactNode, createContext, useEffect } from 'react'
import { useAppStore } from './store'

export const StoreContext = createContext<IStoreState | undefined>(undefined)

const AuthContext = createContext<ReturnType<typeof useAppStore> | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { loading, setLoading, user } = useAppStore()
  useEffect(() => {
    setLoading(false)
  }, [user])
  if (loading) return <Loader />
  return <AuthContext.Provider value={useAppStore}>{children}</AuthContext.Provider>
}
