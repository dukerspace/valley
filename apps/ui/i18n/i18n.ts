export const locales = ['en', 'th']
export const defaultLocale = 'th'

export async function getMessages(locale: string) {
  if (!locales.includes(locale)) {
    locale = defaultLocale
  }

  const account = await import(`./locales/${locale}/account.json`)
  const bill = await import(`./locales/${locale}/bill.json`)
  const common = await import(`./locales/${locale}/common.json`)
  const error = await import(`./locales/${locale}/error.json`)

  return {
    ...account,
    ...bill,
    ...common,
    ...error
  }
}
