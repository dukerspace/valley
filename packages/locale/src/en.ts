export const en = {
  app: {
    title: 'Starter Health',
    tagline: 'Monorepo health check',
  },
  health: {
    heading: 'Service status',
    loading: 'Checking API and database…',
    success: 'Everything looks good.',
    error: 'Unable to reach the API or database.',
    status: 'Status',
    database: 'Database',
    timestamp: 'Checked at',
    retry: 'Retry',
    up: 'Up',
    down: 'Down',
  },
  locale: {
    label: 'Language',
    en: 'English',
    th: 'Thai',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type Messages = DeepStringify<typeof en>
