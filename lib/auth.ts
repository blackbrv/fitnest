"use server"

import '@/lib/env'
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
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

export async function createSession(
  payload: Omit<SessionPayload, "sessionVersion">,
): Promise<string> {
  // Fetch current sessionVersion so forged tokens with a stale version are rejected
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { sessionVersion: true },
  })
  const sessionVersion = user?.sessionVersion ?? 0

  const fullPayload: SessionPayload = { ...payload, sessionVersion }
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const token = await new SignJWT(fullPayload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret())

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

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getSecret())
    const session = payload as unknown as SessionPayload

    // Verify sessionVersion against DB — this is what makes logout and password
    // reset actually invalidate existing tokens.
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
