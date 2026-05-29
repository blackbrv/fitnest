import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ROUTES } from '@/constants'
import { Sidebar } from '@/components/shared/Sidebar'
import { MobileNav } from '@/components/shared/MobileNav'
import { PageTransition } from '@/components/ui/Motion'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect(ROUTES.LOGIN)
  }

  return (
    <div className="flex min-h-screen bg-[#0f1115]">
      {/* Desktop sidebar */}
      <Sidebar session={session} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
