'use client'
import { useGetMe } from '@/hooks/api/user/mutation'

export default function ProfilePage() {
  const { data: me } = useGetMe()

  return <>{me?.data?.username}</>
}
