import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas — deixa passar
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Verifica token no cookie (será salvo no login)
  const token = request.cookies.get('clinicflow-token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}
