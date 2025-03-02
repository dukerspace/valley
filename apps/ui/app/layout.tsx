import { Footer } from '@/components/footer/footer'
import Header from '@/components/header/header'
import { AuthProvider } from '@/hooks/AuthProvider'
import { ReactQueryClientProvider } from '@/hooks/reactQueryClientProvider'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <ReactQueryClientProvider>
        <NextIntlClientProvider messages={messages}>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <AuthProvider>
              <Header />
              <div className="container mx-auto">{children}</div>
              <Footer />
            </AuthProvider>
          </body>
        </NextIntlClientProvider>
      </ReactQueryClientProvider>
    </html>
  )
}
