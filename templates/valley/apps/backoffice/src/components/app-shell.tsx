import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { LocaleSwitcher } from '#components/locale-switcher'
import { useLocale } from '#hooks/use-locale'
import { Button } from '@valley/ui/components/button'
import { logoutAdmin } from '#lib/auth'

export function AppShell({ children }: { children: ReactNode }) {
  const { messages } = useLocale()

  function logout() {
    logoutAdmin()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                {messages.backoffice.tagline}
              </p>
              <p className="font-semibold">{messages.backoffice.title}</p>
            </div>
            <nav className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/users">{messages.backoffice.usersTitle}</Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <Button type="button" variant="outline" size="sm" onClick={logout}>
              {messages.nav.logout}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
