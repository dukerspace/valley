import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@valley/ui/components/card'
import { Button } from '@valley/ui/components/button'
import { Field, fieldClass } from '#components/form-field'
import { useLocale } from '#hooks/use-locale'
import { ApiError } from '#lib/api'
import { forgotAdminPassword } from '#lib/auth'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { messages } = useLocale()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotAdminPassword({ email })
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{messages.auth.forgotTitle}</CardTitle>
          <CardDescription>{messages.auth.forgotHint}</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{messages.auth.forgotSuccess}</p>
              <Link to="/login" className="text-sm underline">
                {messages.auth.backToLogin}
              </Link>
            </div>
          ) : (
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
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={loading}>
                {loading ? messages.common.loading : messages.auth.submitForgot}
              </Button>
              <Link to="/login" className="text-sm underline">
                {messages.auth.backToLogin}
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
