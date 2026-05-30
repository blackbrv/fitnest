import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  let avatar: string | null = null
  if (session) {
    try {
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { avatar: true },
      })
      avatar = user?.avatar ?? null
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-background min-h-screen w-full overflow-x-hidden flex flex-col">
      <Navbar
        session={session ? { name: session.name, email: session.email, avatar } : null}
      />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
