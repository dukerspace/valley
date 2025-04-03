'use server'

import { COOKIE_ACCESS_TOKEN, COOKIE_LANG } from '@/lib/constant'
import { cookies } from 'next/headers'

export const getRequest = async () => {
  const cookie = await cookies()

  return {
    token: cookie.get(COOKIE_ACCESS_TOKEN!)?.value,
    lang: cookie.get(COOKIE_LANG!)?.value
  }
}
