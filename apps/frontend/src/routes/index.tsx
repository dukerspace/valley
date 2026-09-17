import { createFileRoute } from '@tanstack/react-router'
import { HealthPanel } from '#components/health-panel'
import { LocaleSwitcher } from '#components/locale-switcher'
import { useLocale } from '#hooks/use-locale'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { messages } = useLocale()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {messages.app.tagline}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {messages.app.title}
          </h1>
        </div>
        <LocaleSwitcher />
      </header>
      <HealthPanel />
    </main>
  )
}
