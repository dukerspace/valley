import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@valley/ui/components/card'
import { Button } from '@valley/ui/components/button'
import { LocaleSwitcher } from '#components/locale-switcher'
import { Field, fieldClass } from '#components/form-field'
import { useLocale } from '#hooks/use-locale'
import { ApiError } from '#lib/api'
import { checkCanInit, initSuperAdmin, loginAdmin } from '#lib/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { messages } = useLocale()
  const navigate = useNavigate()
  const [canInit, setCanInit] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void checkCanInit()
      .then((res) => setCanInit(Boolean(res.data?.canInit)))
      .catch(() => setCanInit(false))
  }, [])

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginAdmin(username, password)
      await navigate({ to: '/users' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    } finally {
      setLoading(false)
    }
  }

  async function onInit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await initSuperAdmin({ username, email, password })
      await navigate({ to: '/users' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {canInit ? messages.backoffice.initTitle : messages.backoffice.loginTitle}
          </CardTitle>
          <CardDescription>{messages.backoffice.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => void (canInit ? onInit(e) : onLogin(e))}
          >
            <Field label={messages.auth.username}>
              <input
                className={fieldClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={canInit ? 3 : 1}
              />
            </Field>
            {canInit ? (
              <Field label={messages.auth.email}>
                <input
                  className={fieldClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
            ) : null}
            <Field label={messages.auth.password}>
              <input
                className={fieldClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={canInit ? 8 : 1}
              />
            </Field>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={loading}>
              {loading
                ? messages.common.loading
                : canInit
                  ? messages.backoffice.initTitle
                  : messages.auth.submitLogin}
            </Button>
            {!canInit ? (
              <Link to="/forgot-password" className="text-sm underline">
                {messages.auth.forgotLink}
              </Link>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
