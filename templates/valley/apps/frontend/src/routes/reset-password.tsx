import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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
import { resetPassword } from '#lib/auth'

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
    email: typeof search.email === 'string' ? search.email : '',
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { messages } = useLocale()
  const navigate = useNavigate()
  const { token: tokenFromQuery, email: emailFromQuery } = Route.useSearch()
  const [email, setEmail] = useState(emailFromQuery)
  const [token, setToken] = useState(tokenFromQuery)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const prefilled = useMemo(
    () => Boolean(tokenFromQuery && emailFromQuery),
    [tokenFromQuery, emailFromQuery]
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword({ email, token, newPassword, confirmPassword })
      await navigate({ to: '/login' })
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
            <CardTitle>{messages.auth.resetTitle}</CardTitle>
            <CardDescription>
              {prefilled ? messages.auth.resetSuccess : messages.auth.forgotHint}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={(e) => void onSubmit(e)}>
              <Field label={messages.auth.email}>
                <input
                  className={fieldClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Token">
                <input
                  className={fieldClass}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </Field>
              <Field label={messages.auth.newPassword}>
                <input
                  className={fieldClass}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              <Field label={messages.auth.confirmPassword}>
                <input
                  className={fieldClass}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={loading}>
                {loading ? messages.common.loading : messages.auth.submitReset}
              </Button>
              <Link to="/login" className="text-sm underline">
                {messages.auth.backToLogin}
              </Link>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
