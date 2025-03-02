'use server'

import { cookies } from 'next/headers'
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from './constant'

export const setCookieAuth = async (accessToken: string, refreshToken: string) => {
  const cookie = await cookies()

  cookie.set(COOKIE_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    sameSite: 'strict'
  })

  cookie.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    sameSite: 'strict'
  })
}

export const clearCookieAuth = async () => {
  const cookie = await cookies()
  cookie.delete(COOKIE_ACCESS_TOKEN)
  cookie.delete(COOKIE_REFRESH_TOKEN)
}

export const getRefreshToken = async () => {
  const cookie = await cookies()
  return cookie.get(COOKIE_REFRESH_TOKEN!)?.value
}
