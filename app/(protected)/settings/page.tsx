import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROUTES } from '@/constants'
import { SettingsForm } from '@/components/shared/SettingsForm'
import { SettingsTabs } from '@/components/shared/SettingsTabs'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect(ROUTES.LOGIN)

  let userName = session.name
  let userEmail = session.email
  let familyName: string | null = null

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    })
    if (user) {
      userName = user.name
      userEmail = user.email
    }

    const familyMember = await db.familyMember.findFirst({
      where: { userId: session.userId },
      include: { family: { select: { familyName: true } } },
    })
    familyName = familyMember?.family?.familyName ?? null
  } catch {
    // Use session data
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'family', label: 'Family' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'account', label: 'Account' },
  ]

  return (
    <div className="p-5 lg:p-7 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f5f7fa]">Settings</h1>
        <p className="mt-1 text-sm text-[#8b95a5]">
          Manage your profile, family, and preferences
        </p>
      </div>

      <SettingsTabs
        tabs={tabs}
        defaultValues={{ name: userName, email: userEmail }}
        familyName={familyName}
      />
    </div>
  )
}
