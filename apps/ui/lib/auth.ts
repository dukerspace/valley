'use server'

import { IUserInfo } from '@workspace/utils'
import { cookies } from 'next/headers'
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, COOKIE_USER } from './constant'

export const setCookieAuth = async (
  accessToken: string,
  refreshToken: string,
  user?: IUserInfo
) => {
  const cookie = await cookies()

  cookie.set(COOKIE_USER, JSON.stringify(user))

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
  cookie.delete(COOKIE_USER)
  cookie.delete(COOKIE_ACCESS_TOKEN)
  cookie.delete(COOKIE_REFRESH_TOKEN)
}

export const getToken = async () => {
  const cookie = await cookies()
  return cookie.get(COOKIE_ACCESS_TOKEN!)?.value
}

export const getRefreshToken = async () => {
  const cookie = await cookies()
  return cookie.get(COOKIE_REFRESH_TOKEN!)?.value
}

export const getUser = async (): Promise<IUserInfo | undefined> => {
  const cookie = await cookies()
  const data = cookie.get(COOKIE_USER!)?.value
  if (data) {
    return JSON.parse(data)
  }
  return undefined
}
