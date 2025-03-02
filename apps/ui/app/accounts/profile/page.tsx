'use client'
import { useGetMe } from '@/hooks/services/useUser'

export default function ProfilePage() {
  const { data: me } = useGetMe()

  return <>{me?.data?.username}</>
}
