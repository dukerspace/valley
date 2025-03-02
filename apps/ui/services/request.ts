'use server'

import { COOKIE_ACCESS_TOKEN } from '@/lib/constant'
import { cookies } from 'next/headers'

export const getRequest = async () => {
  const cookie = await cookies()
  return cookie.get(COOKIE_ACCESS_TOKEN!)?.value
}
