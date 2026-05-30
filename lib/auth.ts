"use server"

import '@/lib/env'
import { SignJWT, jwtVerify } from "jose"
import { cookies, headers } from "next/headers"
import { SessionPayload } from "@/types"
import { db } from "@/lib/db"

const SESSION_COOKIE = "fitnest_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const MIN_SECRET_BYTES = 32

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  const encoded = new TextEncoder().encode(secret)
  if (encoded.byteLength < MIN_SECRET_BYTES) {
    throw new Error(
      `JWT_SECRET is too short (${encoded.byteLength} bytes). Minimum: ${MIN_SECRET_BYTES} bytes. ` +
      "Generate one with: openssl rand -hex 32",
    )
  }
  return encoded
}

/** Generates a signed JWT without touching cookies — used by API auth routes for mobile clients. */
export async function createToken(
  payload: Omit<SessionPayload, "sessionVersion">,
): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { sessionVersion: true },
  })
  const sessionVersion = user?.sessionVersion ?? 0
  const fullPayload: SessionPayload = { ...payload, sessionVersion }
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  return new SignJWT(fullPayload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret())
}

/** Creates a session JWT and sets the httpOnly cookie — used by the web app (Server Actions). */
export async function createSession(
  payload: Omit<SessionPayload, "sessionVersion">,
): Promise<string> {
  const token = await createToken(payload)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
  return token
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

export async function setSessionToken(token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
}

/**
 * Resolves the current session from either:
 *  1. `Authorization: Bearer <token>` header  — mobile / API clients
 *  2. `fitnest_session` httpOnly cookie        — web clients
 * Both sources are validated with sessionVersion to honour logout/password-reset.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    let token: string | null = null

    // 1. Check Authorization header (mobile / Postman)
    try {
      const headerStore = await headers()
      const authHeader = headerStore.get("authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim()
      }
    } catch {
      // headers() is unavailable in some non-request contexts (e.g. cron) — safe to ignore
    }

    // 2. Fall back to session cookie (web)
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get(SESSION_COOKIE)?.value ?? null
    }

    if (!token) return null

    const { payload } = await jwtVerify(token, getSecret())
    const session = payload as unknown as SessionPayload

    // Verify sessionVersion against DB — invalidates tokens after logout / password reset
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { sessionVersion: true },
    })
    if (!user || user.sessionVersion !== session.sessionVersion) return null

    return session
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function incrementSessionVersion(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  })
}
