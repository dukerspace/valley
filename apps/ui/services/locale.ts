'use server'

import { COOKIE_LANG } from '@/lib/constant'
import { cookies } from 'next/headers'

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_LANG)?.value || 'th'
}

export async function setUserLocale(locale: string) {
  ;(await cookies()).set(COOKIE_LANG, locale)
}
