import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 공개 경로 (라우팅 가드 제외)
  const publicPaths = ['/onboarding', '/login', '/api']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  // 클라이언트 사이드에서 localStorage 체크는 클라이언트 컴포넌트에서 처리
  // 미들웨어에서는 쿠키나 헤더 기반 체크만 가능
  // 여기서는 기본 라우팅만 처리하고, 실제 가드는 클라이언트에서 처리
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

