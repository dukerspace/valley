import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import type { UserDto } from '@valley/shared'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@valley/ui/components/card'
import { Button } from '@valley/ui/components/button'
import { AppShell } from '#components/app-shell'
import { Field, fieldClass } from '#components/form-field'
import { useLocale } from '#hooks/use-locale'
import { ApiError, getAdminAccessToken } from '#lib/api'
import { createUser, deleteUser, listUsers, updateUser } from '#lib/auth'

export const Route = createFileRoute('/users')({
  component: UsersPage,
})

function UsersPage() {
  const { messages } = useLocale()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserDto[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listUsers(page, 10, q || undefined)
      setUsers(res.data)
      setTotalPages(res.pagination.totalPages)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await navigate({ to: '/login' })
        return
      }
      setError(err instanceof ApiError ? err.message : messages.common.error)
    } finally {
      setLoading(false)
    }
  }, [page, q, navigate, messages.common.error])

  useEffect(() => {
    if (!getAdminAccessToken()) {
      void navigate({ to: '/login' })
      return
    }
    void load()
  }, [load, navigate])

  function openCreate() {
    setCreating(true)
    setEditing(null)
    setForm({ username: '', email: '', password: '', firstName: '', lastName: '' })
  }

  function openEdit(user: UserDto) {
    setEditing(user)
    setCreating(false)
    setForm({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    })
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (creating) {
        await createUser({
          username: form.username,
          email: form.email,
          password: form.password,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
        })
      } else if (editing) {
        await updateUser(editing.id, {
          username: form.username,
          email: form.email,
          password: form.password || undefined,
          firstName: form.firstName || null,
          lastName: form.lastName || null,
        })
      }
      setCreating(false)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    }
  }

  async function onDelete(user: UserDto) {
    if (!window.confirm(messages.backoffice.confirmDelete)) return
    try {
      await deleteUser(user.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.common.error)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold">{messages.backoffice.usersTitle}</h1>
          <Button type="button" onClick={openCreate}>
            {messages.backoffice.createUser}
          </Button>
        </div>

        <div className="flex gap-2">
          <input
            className={fieldClass}
            placeholder={messages.backoffice.search}
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {(creating || editing) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {creating ? messages.backoffice.createUser : messages.backoffice.editUser}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => void onSave(e)}>
                <Field label={messages.auth.username}>
                  <input
                    className={fieldClass}
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    required
                    minLength={3}
                  />
                </Field>
                <Field label={messages.auth.email}>
                  <input
                    className={fieldClass}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </Field>
                <Field label={messages.auth.password}>
                  <input
                    className={fieldClass}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required={creating}
                    minLength={creating ? 8 : undefined}
                  />
                </Field>
                <Field label={messages.auth.firstName}>
                  <input
                    className={fieldClass}
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </Field>
                <Field label={messages.auth.lastName}>
                  <input
                    className={fieldClass}
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </Field>
                <div className="flex items-end gap-2 sm:col-span-2">
                  <Button type="submit">{messages.common.save}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreating(false)
                      setEditing(null)
                    }}
                  >
                    {messages.common.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-muted-foreground">{messages.common.loading}</p>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground">{messages.backoffice.noUsers}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 pr-4">{messages.auth.username}</th>
                      <th className="py-2 pr-4">{messages.auth.email}</th>
                      <th className="py-2 pr-4">{messages.auth.firstName}</th>
                      <th className="py-2">{messages.backoffice.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2 pr-4">{user.username}</td>
                        <td className="py-2 pr-4">{user.email}</td>
                        <td className="py-2 pr-4">{user.firstName ?? '—'}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(user)}
                            >
                              {messages.backoffice.editUser}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => void onDelete(user)}
                            >
                              {messages.backoffice.deleteUser}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {messages.backoffice.prev}
              </Button>
              <span className="text-sm text-muted-foreground">
                {messages.backoffice.page} {page} {messages.backoffice.of} {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {messages.backoffice.next}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
