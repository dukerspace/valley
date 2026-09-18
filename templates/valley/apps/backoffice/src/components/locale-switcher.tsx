import { useLocale } from '#hooks/use-locale'
import { Button } from '@valley/ui/components/button'

export function LocaleSwitcher() {
  const { locale, setLocale, messages } = useLocale()

  return (
    <div className="flex items-center gap-2" role="group" aria-label={messages.locale.label}>
      <Button
        type="button"
        size="sm"
        variant={locale === 'en' ? 'default' : 'outline'}
        onClick={() => setLocale('en')}
      >
        {messages.locale.en}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={locale === 'th' ? 'default' : 'outline'}
        onClick={() => setLocale('th')}
      >
        {messages.locale.th}
      </Button>
    </div>
  )
}
