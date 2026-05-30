"use server"

import { cookies } from "next/headers"
import { jwtVerify } from "jose"

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

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "fallback-secret-key-for-dev-only"
  return new TextEncoder().encode(secret)
}

export async function getAccountStore(): Promise<AccountStore> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get(ACCOUNTS_COOKIE)?.value
    if (!raw) return { accounts: [] }
    const decoded = Buffer.from(raw, "base64url").toString("utf-8")
    return JSON.parse(decoded) as AccountStore
  } catch {
    return { accounts: [] }
  }
}

async function saveAccountStore(store: AccountStore): Promise<void> {
  const encoded = Buffer.from(JSON.stringify(store)).toString("base64url")
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
      // Remove the oldest account to stay under the limit
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
