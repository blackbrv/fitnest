import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROUTES } from '@/constants'
import { Sidebar } from '@/components/shared/Sidebar'
import { MobileNav } from '@/components/shared/MobileNav'
import { Header } from '@/components/shared/Header'
import { getAccountStore, isTokenValid, removeStoredAccount } from '@/lib/multi-auth'
import type { AccountSwitcherItem } from '@/components/shared/AccountSwitcher'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect(ROUTES.LOGIN)
  }

  let userAvatar: string | null = null
  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { avatar: true },
    })
    userAvatar = user?.avatar ?? null
  } catch {
    // ignore
  }

  // Build accounts list for switcher — validate tokens and prune expired ones
  let accounts: AccountSwitcherItem[] = []
  try {
    const store = await getAccountStore()
    const validated: AccountSwitcherItem[] = []
    for (const account of store.accounts) {
      const valid = await isTokenValid(account.token)
      if (valid) {
        validated.push({
          userId: account.userId,
          name: account.name,
          email: account.email,
          isActive: account.userId === session.userId,
        })
      } else {
        // Silently prune expired accounts
        await removeStoredAccount(account.userId)
      }
    }
    accounts = validated
  } catch {
    // ignore — accounts switcher is non-critical
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar session={session} avatar={userAvatar} accounts={accounts} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">
        <Header
          userName={session.name}
          userEmail={session.email}
          userAvatar={userAvatar}
        />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
