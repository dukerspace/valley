import { Link } from '@tanstack/react-router'
import { LocaleSwitcher } from '#components/locale-switcher'
import { useLocale } from '#hooks/use-locale'
import { Button } from '@valley/ui/components/button'
import { apiRequest } from '#lib/api'

export function AppNav() {
  const { messages } = useLocale()

  async function logout() {
    try {
      await apiRequest('/api/v1/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    window.location.href = '/login'
  }

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">{messages.nav.home}</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">{messages.nav.login}</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/register">{messages.nav.register}</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/account">{messages.nav.account}</Link>
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={() => void logout()}>
          {messages.nav.logout}
        </Button>
      </nav>
      <LocaleSwitcher />
    </header>
  )
}
