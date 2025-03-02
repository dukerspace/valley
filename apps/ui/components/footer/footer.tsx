'use client'

import { setUserLocale } from '@/services/locale'
import { startTransition } from 'react'

export const Footer = () => {
  function onChange(value: string) {
    startTransition(() => {
      setUserLocale(value)
    })
  }

  return (
    <div className="container mx-auto footer mb-4 sticky bottom-0">
      <div className="flex">
        <div className="px-2 cursor-pointer" onClick={() => onChange('th')}>
          th
        </div>{' '}
        |{' '}
        <div className="px-2 cursor-pointer" onClick={() => onChange('en')}>
          en
        </div>
      </div>
    </div>
  )
}
