'use client'

import AlertError from '@/components/alert/error'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import PasswordInput from '@/components/ui/password'
import { Separator } from '@/components/ui/separator'
import { useLogin } from '@/hooks/services/useAuth'
import { useAppStore } from '@/hooks/store'
import { setCookieAuth } from '@/lib/auth'
import { loginSchema } from '@/schema'
import { useForm } from '@tanstack/react-form'
import { IAuthRequest } from '@valley/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignInPage() {
  const router = useRouter()
  const loginService = useLogin()
  const { setUser } = useAppStore()

  const [error, setError] = useState<string>()

  const init: IAuthRequest = {
    username: '',
    password: ''
  }

  const form = useForm({
    defaultValues: init,
    validators: {
      onChange: loginSchema
    },
    onSubmit: async ({ value }) => {
      loginService.mutate(
        {
          data: { username: value.username, password: value.password }
        },
        {
          onSuccess: async (data) => {
            const result = data?.data
            console.log('----', data)
            setUser(result!.user)
            setCookieAuth(result!.accessToken, result!.refreshToken)

            router.push('/')
          },
          onError: () => {
            setError('Username or password not match.')
          }
        }
      )
    }
  })

  return (
    <div className="max-w-[450px] mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <AlertError message={error || ''} />
          </div>

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
                      <em>{field.state.meta.errors.join(',')}</em>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="py-2">
              <form.Field name="password">
                {(field) => (
                  <>
                    <PasswordInput
                      name={field.name}
                      value={field.state.value}
                      placeholder="Password"
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length ? (
                      <em>{field.state.meta.errors.join(',')}</em>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>
            <div className="py-2">
              <Button>Login</Button>
            </div>
          </form>
          <Separator />
          <div className="py-2">
            <Link href={'/user/create'}>Create Account</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
