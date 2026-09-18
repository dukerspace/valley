import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { UserDto } from '@valley/shared'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@valley/ui/components/card'
import { Button } from '@valley/ui/components/button'
import { AppNav } from '#components/app-nav'
import { Field, fieldClass } from '#components/form-field'
import { useLocale } from '#hooks/use-locale'
import { ApiError } from '#lib/api'
import { changePassword, getMe, updateMe } from '#lib/auth'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

function AccountPage() {
  const { messages } = useLocale()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const res = await getMe()
        setUser(res.data ?? null)
        setFirstName(res.data?.firstName ?? '')
        setLastName(res.data?.lastName ?? '')
        setPhone(res.data?.phone ?? '')
      } catch {
        await navigate({ to: '/login' })
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate])

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setProfileMsg(null)
    try {
      const res = await updateMe({
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
      })
      setUser(res.data ?? null)
      setProfileMsg(messages.auth.submitUpdate)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPasswordMsg(null)
    try {
      const res = await changePassword({ oldPassword, newPassword, confirmPassword })
      setPasswordMsg(res.data?.message ?? messages.auth.submitChangePassword)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <p className="p-8 text-center text-muted-foreground">{messages.common.loading}</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold">{messages.auth.accountTitle}</h1>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>{messages.auth.profileTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={(e) => void onSaveProfile(e)}>
              <p className="text-sm text-muted-foreground">
                {user.username} · {user.email}
              </p>
              <Field label={messages.auth.firstName}>
                <input
                  className={fieldClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>
              <Field label={messages.auth.lastName}>
                <input
                  className={fieldClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>
              <Field label={messages.auth.phone}>
                <input
                  className={fieldClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              {profileMsg ? <p className="text-sm text-muted-foreground">{profileMsg}</p> : null}
              <Button type="submit">{messages.auth.submitUpdate}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{messages.auth.changePasswordTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={(e) => void onChangePassword(e)}>
              <Field label={messages.auth.oldPassword}>
                <input
                  className={fieldClass}
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
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
              {passwordMsg ? (
                <p className="text-sm text-muted-foreground">{passwordMsg}</p>
              ) : null}
              <Button type="submit">{messages.auth.submitChangePassword}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
