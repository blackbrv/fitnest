import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROUTES } from '@/constants'
import { Sidebar } from '@/components/shared/Sidebar'
import { MobileNav } from '@/components/shared/MobileNav'
import { Header } from '@/components/shared/Header'

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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar session={session} avatar={userAvatar} />

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
