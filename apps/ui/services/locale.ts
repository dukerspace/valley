'use server'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'LANG'

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value || 'th'
}

export async function setUserLocale(locale: string) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
