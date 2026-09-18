import { en, type Messages } from './en.ts'
import { th } from './th.ts'

export const locales = ['en', 'th'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const catalogs: Record<Locale, Messages> = {
  en,
  th,
}

export function getMessages(locale: Locale = defaultLocale): Messages {
  return catalogs[locale] ?? catalogs[defaultLocale]
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export { en, th }
export type { Messages }
