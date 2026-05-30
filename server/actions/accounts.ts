'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  getAccountStore,
  removeStoredAccount,
  isTokenValid,
} from '@/lib/multi-auth'
import { getSession, setSessionToken, deleteSession } from '@/lib/auth'
import { ActionResult } from '@/types'

export async function switchAccount(userId: string): Promise<ActionResult> {
  const store = await getAccountStore()
  const account = store.accounts.find((a) => a.userId === userId)

  if (!account) {
    return { success: false, error: 'Account not found' }
  }

  const valid = await isTokenValid(account.token)
  if (!valid) {
    await removeStoredAccount(userId)
    return { success: false, error: 'SESSION_EXPIRED' }
  }

  await setSessionToken(account.token)
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function removeAccount(userId: string): Promise<ActionResult> {
  const session = await getSession()
  const isActive = session?.userId === userId

  await removeStoredAccount(userId)

  if (isActive) {
    const store = await getAccountStore()

    // Try to switch to the first remaining valid account
    for (const account of store.accounts) {
      const valid = await isTokenValid(account.token)
      if (valid) {
        await setSessionToken(account.token)
        revalidatePath('/', 'layout')
        redirect('/dashboard')
      } else {
        await removeStoredAccount(account.userId)
      }
    }

    // No valid accounts left — full logout
    await deleteSession()
    redirect('/login')
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
