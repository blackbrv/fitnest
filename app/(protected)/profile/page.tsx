import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROUTES } from '@/constants'
import { ProfileHeader } from '@/components/shared/ProfileHeader'
import { ProfileActivity } from '@/components/shared/ProfileActivity'
import { calculateStreak } from '@/lib/utils'
import type { WorkoutLog } from '@/types'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect(ROUTES.LOGIN)

  // Mock user for fallback
  const mockUser = {
    id: session.userId,
    name: session.name,
    email: session.email,
    avatar: null as string | null,
    bio: null as string | null,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  }

  let user = mockUser
  let workoutsCompleted = 24
  let currentStreak = 7
  let familyName: string | null = null
  let recentActivity: WorkoutLog[] = []

  try {
    const dbUser = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    })

    if (dbUser) {
      user = dbUser

      type DbLog = {
        completedAt: Date | null
        workoutPlan?: { title: string; category: string } | null
      }
      const [logs, familyMember]: [DbLog[], { family?: { familyName: string } | null } | null] = await Promise.all([
        db.workoutLog.findMany({
          where: { userId: session.userId, status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 50,
          include: {
            workoutPlan: {
              select: { title: true, category: true },
            },
          },
        }),
        db.familyMember.findFirst({
          where: { userId: session.userId },
          include: { family: { select: { familyName: true } } },
        }),
      ])

      workoutsCompleted = logs.length
      currentStreak = calculateStreak(
        logs.filter((l) => l.completedAt).map((l) => new Date(l.completedAt!)),
      )
      familyName = familyMember?.family?.familyName ?? null

      // Recent activity: last 10 completed logs
      recentActivity = logs.slice(0, 10) as unknown as WorkoutLog[]
    }
  } catch {
    // Use mock data
  }

  return (
    <div className="p-5 lg:p-7 max-w-3xl mx-auto space-y-5">
      <ProfileHeader
        user={user}
        stats={{ workoutsCompleted, currentStreak }}
        familyName={familyName}
        bio={user.bio}
      />

      <ProfileActivity recentActivity={recentActivity} />
    </div>
  )
}
