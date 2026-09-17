import { useCallback, useEffect, useState } from 'react'
import { healthResponseSchema, type HealthResponse } from '@starter/shared'
import { Button } from '@starter/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@starter/ui/components/card'
import { useLocale } from '#hooks/use-locale'
import { getApiBaseUrl } from '#lib/env'

type HealthState =
  | { status: 'loading' }
  | { status: 'success'; data: HealthResponse }
  | { status: 'error'; message: string }

export function HealthPanel() {
  const { messages } = useLocale()
  const [state, setState] = useState<HealthState>({ status: 'loading' })

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const response = await fetch(`${getApiBaseUrl()}/health`)
      const json = await response.json()
      const data = healthResponseSchema.parse(json)
      if (!response.ok || data.database === 'down') {
        setState({ status: 'error', message: data.message ?? messages.health.error })
        return
      }
      setState({ status: 'success', data })
    } catch {
      setState({ status: 'error', message: messages.health.error })
    }
  }, [messages.health.error])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{messages.health.heading}</CardTitle>
        <CardDescription>
          {state.status === 'loading' && messages.health.loading}
          {state.status === 'success' && messages.health.success}
          {state.status === 'error' && messages.health.error}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {state.status === 'success' && (
          <>
            <Row label={messages.health.status} value={state.data.status} />
            <Row
              label={messages.health.database}
              value={state.data.database === 'up' ? messages.health.up : messages.health.down}
            />
            <Row
              label={messages.health.timestamp}
              value={new Date(state.data.timestamp).toLocaleString()}
            />
          </>
        )}
        {state.status === 'error' && <p className="text-destructive">{state.message}</p>}
        {state.status === 'loading' && (
          <p className="text-muted-foreground" aria-live="polite">
            {messages.health.loading}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button type="button" onClick={() => void load()} disabled={state.status === 'loading'}>
          {messages.health.retry}
        </Button>
      </CardFooter>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  )
}
