import { NextRequest, NextResponse } from 'next/server'
import { getToken } from './lib/auth'

export async function middleware(req: NextRequest) {
  const token = await getToken()
  const { pathname } = req.nextUrl
  const publicPaths = ['/account/create']

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  if (pathname.includes('/auth/login') && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname !== '/auth/login' && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/o/:path*', '/account/:path*', '/auth/login', '/account/create']
}
