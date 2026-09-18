import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAdminAccessToken } from '#lib/api'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && getAdminAccessToken()) {
      throw redirect({ to: '/users' })
    }
    throw redirect({ to: '/login' })
  },
})
