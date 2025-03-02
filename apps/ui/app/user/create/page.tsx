'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCreateUser } from '@/hooks/services/useUser'
import { createUserSchema } from '@/schema'
import { useForm } from '@tanstack/react-form'
import { CreateUserDto } from '@valley/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserCreatePage() {
  const router = useRouter()
  const createUserService = useCreateUser()
  const t = useTranslations()

  const init: CreateUserDto = {
    username: '',
    password: '',
    email: ''
  }

  const form = useForm({
    defaultValues: init,
    validators: {
      onChange: createUserSchema
    },
    onSubmit: ({ value }) => {
      createUserService.mutate(
        {
          data: value
        },
        {
          onSuccess: async () => {
            return router.push(`/auth/login`)
          }
        }
      )
    }
  })

  return (
    <div className="max-w-[450px] mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Create</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <div className="py-2">
              <form.Field name="username">
                {(field) => (
                  <>
                    <Input
                      name={field?.name}
                      placeholder="Username"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    {field.state.meta.errors.length ? (
                      <em>{field.state.meta.errors.map((e) => e?.message).join(',')}</em>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="py-2">
              <form.Field name="password">
                {(field) => {
                  return (
                    <>
                      <Input
                        name={field.name}
                        value={field.state.value}
                        type="password"
                        placeholder="Password"
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length ? (
                        <em>
                          {field.state.meta.errors
                            .map((e) => {
                              return t(`${e?.message}`)
                            })
                            .join(',')}
                        </em>
                      ) : null}
                    </>
                  )
                }}
              </form.Field>
            </div>

            <div className="py-2">
              <form.Field name="email">
                {(field) => (
                  <>
                    <Input
                      name={field?.name}
                      value={field.state.value}
                      placeholder="Email"
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length ? (
                      <em>{field.state.meta.errors.map((e) => e?.message).join(',')}</em>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="py-2">
              <Button type="submit">Create</Button>
            </div>
          </form>

          <Separator />
          <Link href={'/auth/login'}>Login</Link>
        </CardContent>
      </Card>
    </div>
  )
}
