import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@valley/ui/components/card'
import { Button } from '@valley/ui/components/button'
import { AppNav } from '#components/app-nav'
import { Field, fieldClass } from '#components/form-field'
import { useLocale } from '#hooks/use-locale'
import { ApiError } from '#lib/api'
import { loginUser } from '#lib/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { messages } = useLocale()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginUser(username, password)
      await navigate({ to: '/account' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto w-full max-w-md px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{messages.auth.loginTitle}</CardTitle>
            <CardDescription>
              <Link to="/register" className="underline">
                {messages.auth.needAccount}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={(e) => void onSubmit(e)}>
              <Field label={messages.auth.username}>
                <input
                  className={fieldClass}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </Field>
              <Field label={messages.auth.password}>
                <input
                  className={fieldClass}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={loading}>
                {loading ? messages.common.loading : messages.auth.submitLogin}
              </Button>
              <Link to="/forgot-password" className="text-sm underline">
                {messages.auth.forgotLink}
              </Link>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
