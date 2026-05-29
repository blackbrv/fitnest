import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/privacy", "/terms"]
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]
const PROTECTED_PREFIX = ["/dashboard", "/family-management", "/workout-plans", "/statistics", "/notifications", "/settings", "/profile"]

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "fallback-secret-key-for-dev-only"
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("fitnest_session")?.value

  const isProtected = PROTECTED_PREFIX.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

  let isAuthenticated = false
  if (token) {
    try {
      await jwtVerify(token, getSecret())
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
