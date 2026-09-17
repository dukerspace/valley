import { locales, type Locale } from '@starter/locale'
import { Button } from '@starter/ui/components/button'
import { useLocale } from '#hooks/use-locale'

export function LocaleSwitcher() {
  const { locale, setLocale, messages } = useLocale()

  return (
    <div className="flex items-center gap-2" role="group" aria-label={messages.locale.label}>
      {locales.map((code) => (
        <Button
          key={code}
          type="button"
          size="sm"
          variant={locale === code ? 'default' : 'outline'}
          aria-pressed={locale === code}
          onClick={() => setLocale(code as Locale)}
        >
          {messages.locale[code]}
        </Button>
      ))}
    </div>
  )
}
