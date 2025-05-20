import { getUserLocale } from '@/services/locale'
import { getRequestConfig } from 'next-intl/server'
import { getMessages, locales } from './i18n'

export default getRequestConfig(async () => {
  const locale = await getUserLocale()

  return {
    locale: locale,
    locales: locales,
    messages: await getMessages(locale),
    timeZone: 'Asia/Bangkok'
  }
})
