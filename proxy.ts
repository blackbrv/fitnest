import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

// These redirect logged-in users to /dashboard. /add-account is intentionally excluded
// so authenticated users can add a second account without being redirected.
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]
const PUBLIC_ROUTES = ["/verify-email", "/reset-password"] // accessible without login, no dashboard redirect
const PROTECTED_PREFIX = ["/dashboard", "/family-management", "/workout-plans", "/statistics", "/notifications", "/settings", "/profile", "/activity"]

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "fallback-secret-key-for-dev-only"
  return new TextEncoder().encode(secret)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("fitnest_session")?.value

  const isProtected = PROTECTED_PREFIX.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  let isAuthenticated = false
  if (token) {
    try {
      await jwtVerify(token, getSecret())
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  // Verify-email and reset-password are always accessible (skip all other checks)
  if (isPublicRoute) {
    return NextResponse.next()
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
