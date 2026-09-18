import { createFileRoute } from '@tanstack/react-router'
import { HealthPanel } from '#components/health-panel'
import { AppNav } from '#components/app-nav'
import { useLocale } from '#hooks/use-locale'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { messages } = useLocale()

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {messages.app.tagline}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {messages.app.title}
          </h1>
        </header>
        <HealthPanel />
      </main>
    </div>
  )
}
