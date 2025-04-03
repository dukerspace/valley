import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'
import { defaultLocale, locales } from './i18n'

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
