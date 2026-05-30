"use server"

import '@/lib/env'
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { createHmac, timingSafeEqual } from "crypto"
import { z } from "zod"

const ACCOUNTS_COOKIE = "fitnest_accounts"
const MAX_ACCOUNTS = 8
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

export interface StoredAccount {
  userId: string
  name: string
  email: string
  token: string
  addedAt: string
}

interface AccountStore {
  accounts: StoredAccount[]
}

// ── Zod schemas for runtime cookie validation ─────────────────────────────

const storedAccountSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  token: z.string().min(1),
  addedAt: z.string(),
})

const accountStoreSchema = z.object({
  accounts: z.array(storedAccountSchema),
})

// ── Secret helpers ────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

function getCookieSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return secret
}

// ── HMAC signing for the accounts cookie ─────────────────────────────────

function signPayload(payload: string): string {
  return createHmac("sha256", getCookieSecret()).update(payload).digest("hex")
}

function verifyAndDecodePayload(raw: string): string | null {
  const dotIndex = raw.lastIndexOf(".")
  if (dotIndex === -1) return null

  const payload = raw.slice(0, dotIndex)
  const signature = raw.slice(dotIndex + 1)
  const expectedSig = signPayload(payload)

  try {
    const sigBuf = Buffer.from(signature, "hex")
    const expBuf = Buffer.from(expectedSig, "hex")
    if (sigBuf.length !== expBuf.length) return null
    if (!timingSafeEqual(sigBuf, expBuf)) return null
  } catch {
    return null
  }

  return Buffer.from(payload, "base64url").toString("utf-8")
}

// ── Public API ────────────────────────────────────────────────────────────

export async function getAccountStore(): Promise<AccountStore> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get(ACCOUNTS_COOKIE)?.value
    if (!raw) return { accounts: [] }

    const decoded = verifyAndDecodePayload(raw)
    if (!decoded) return { accounts: [] }

    const parsed = accountStoreSchema.safeParse(JSON.parse(decoded))
    if (!parsed.success) return { accounts: [] }

    return parsed.data
  } catch {
    return { accounts: [] }
  }
}

async function saveAccountStore(store: AccountStore): Promise<void> {
  const payload = Buffer.from(JSON.stringify(store)).toString("base64url")
  const signature = signPayload(payload)
  const encoded = `${payload}.${signature}`

  const cookieStore = await cookies()
  cookieStore.set(ACCOUNTS_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function addOrUpdateStoredAccount(account: StoredAccount): Promise<void> {
  const store = await getAccountStore()
  const idx = store.accounts.findIndex((a) => a.userId === account.userId)

  if (idx !== -1) {
    store.accounts[idx] = account
  } else {
    if (store.accounts.length >= MAX_ACCOUNTS) {
      store.accounts.sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
      )
      store.accounts.shift()
    }
    store.accounts.push(account)
  }

  await saveAccountStore(store)
}

export async function removeStoredAccount(userId: string): Promise<void> {
  const store = await getAccountStore()
  store.accounts = store.accounts.filter((a) => a.userId !== userId)
  await saveAccountStore(store)
}

export async function clearAccountStore(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCOUNTS_COOKIE)
}

export async function isTokenValid(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}
