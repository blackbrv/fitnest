import { Suspense } from 'react'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculateStreak } from '@/lib/utils'
import { Header } from '@/components/shared/Header'
import { WeeklyStats } from '@/components/dashboard/WeeklyStats'
import { FamilyOverview } from '@/components/dashboard/FamilyOverview'
import { MemberCard } from '@/components/dashboard/MemberCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion'
import type { WorkoutStatus, UserRole } from '@/types'

interface MemberDashboardData {
  id: string
  name: string
  role: UserRole
  streak: number
  completionRate: number
  todayStatus: WorkoutStatus | null
  workoutName: string | null
}

interface DashboardData {
  familyName: string
  inviteCode: string
  totalMembers: number
  completedToday: number
  totalToday: number
  weeklyConsistency: number
  totalWorkoutsWeek: number
  activeStreak: number
  members: MemberDashboardData[]
}

const MOCK_DATA: DashboardData = {
  familyName: 'The Johnson Family',
  inviteCode: 'JHNX7F2K',
  totalMembers: 5,
  completedToday: 4,
  totalToday: 5,
  weeklyConsistency: 82,
  totalWorkoutsWeek: 19,
  activeStreak: 12,
  members: [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'OWNER',
      streak: 12,
      completionRate: 87,
      todayStatus: 'COMPLETED',
      workoutName: 'Full Body Strength',
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      role: 'MEMBER',
      streak: 7,
      completionRate: 74,
      todayStatus: 'COMPLETED',
      workoutName: 'HIIT Cardio Blast',
    },
    {
      id: '3',
      name: 'Emma Johnson',
      role: 'MEMBER',
      streak: 5,
      completionRate: 68,
      todayStatus: 'IN_PROGRESS',
      workoutName: 'Yoga & Mobility',
    },
    {
      id: '4',
      name: 'Liam Johnson',
      role: 'MEMBER',
      streak: 3,
      completionRate: 60,
      todayStatus: 'COMPLETED',
      workoutName: 'Kids Cardio Fun',
    },
    {
      id: '5',
      name: 'Olivia Johnson',
      role: 'MEMBER',
      streak: 0,
      completionRate: 40,
      todayStatus: 'PENDING',
      workoutName: 'Beginner Stretching',
    },
  ],
}

async function getDashboardData(userId: string): Promise<DashboardData> {
  try {
    const familyMember = await db.familyMember.findFirst({
      where: { userId },
      include: { family: true, user: true },
    })

    if (!familyMember) return MOCK_DATA

    const allMembers = await db.familyMember.findMany({
      where: { familyId: familyMember.familyId },
      include: { user: true },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - 6)

    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const memberUserIds = allMembers.map((m: (typeof allMembers)[number]) => m.userId)

    // Batch fetch all logs for the family
    const [allWeekLogs, allStreakLogs, allTodayLogs] = await Promise.all([
      db.workoutLog.findMany({
        where: { userId: { in: memberUserIds }, createdAt: { gte: weekStart } },
      }),
      db.workoutLog.findMany({
        where: { userId: { in: memberUserIds }, status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
        select: { userId: true, createdAt: true },
      }),
      db.workoutLog.findMany({
        where: { userId: { in: memberUserIds }, createdAt: { gte: today, lte: todayEnd } },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Group logs by userId
    type WeekLog = (typeof allWeekLogs)[number]
    type TodayLog = (typeof allTodayLogs)[number]

    const weekLogsByUser = new Map<string, WeekLog[]>()
    const streakDatesByUser = new Map<string, Date[]>()
    const todayLogByUser = new Map<string, TodayLog>()

    for (const log of allWeekLogs) {
      if (!weekLogsByUser.has(log.userId)) weekLogsByUser.set(log.userId, [])
      weekLogsByUser.get(log.userId)!.push(log)
    }
    for (const log of allStreakLogs) {
      if (!streakDatesByUser.has(log.userId)) streakDatesByUser.set(log.userId, [])
      streakDatesByUser.get(log.userId)!.push(new Date(log.createdAt))
    }
    for (const log of allTodayLogs) {
      if (!todayLogByUser.has(log.userId)) todayLogByUser.set(log.userId, log)
    }

    // Fetch workout plan titles for today's logs
    const workoutPlanIds = [
      ...new Set(allTodayLogs.filter((l) => l.workoutPlanId).map((l) => l.workoutPlanId!)),
    ]
    const workoutPlans =
      workoutPlanIds.length > 0
        ? await db.workoutPlan.findMany({ where: { id: { in: workoutPlanIds } } })
        : []
    const workoutPlanTitles = new Map(workoutPlans.map((p: { id: string; title: string }) => [p.id, p.title]))

    const members: MemberDashboardData[] = allMembers.map((m: (typeof allMembers)[number]) => {
      const weekLogs = weekLogsByUser.get(m.userId) ?? []
      const completedWeek = weekLogs.filter((l: WeekLog) => l.status === 'COMPLETED').length
      const completionRate =
        weekLogs.length > 0 ? Math.round((completedWeek / weekLogs.length) * 100) : 0
      const streak = calculateStreak(streakDatesByUser.get(m.userId) ?? [])
      const todayLog = todayLogByUser.get(m.userId)
      const workoutName = todayLog?.workoutPlanId
        ? workoutPlanTitles.get(todayLog.workoutPlanId) ?? null
        : null

      return {
        id: m.userId,
        name: m.user?.name ?? 'Unknown',
        role: m.role as UserRole,
        streak,
        completionRate,
        todayStatus: (todayLog?.status ?? null) as WorkoutStatus | null,
        workoutName,
      }
    })

    const completedToday = members.filter((m) => m.todayStatus === 'COMPLETED').length
    const totalWorkoutsWeek = allWeekLogs.filter((l: WeekLog) => l.status === 'COMPLETED').length
    const activeStreak = members.find((m) => m.id === userId)?.streak ?? 0

    return {
      familyName: familyMember.family.familyName,
      inviteCode: familyMember.family.inviteCode,
      totalMembers: allMembers.length,
      completedToday,
      totalToday: allMembers.length,
      weeklyConsistency:
        members.length > 0
          ? Math.round(members.reduce((sum, m) => sum + m.completionRate, 0) / members.length)
          : 0,
      totalWorkoutsWeek,
      activeStreak,
      members,
    }
  } catch {
    return MOCK_DATA
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  const userId = session?.userId ?? ''

  const data = await getDashboardData(userId)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <Header
        userName={session?.name ?? 'User'}
        userEmail={session?.email ?? ''}
      />

      {/* Dashboard body */}
      <div className="flex-1 px-4 md:px-6 py-5 space-y-5">
        {/* Weekly stats row */}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/8 bg-[#151922] p-4 h-[100px] animate-pulse"
                />
              ))}
            </div>
          }
        >
          <WeeklyStats
            totalWorkouts={data.totalWorkoutsWeek}
            activeStreak={data.activeStreak}
            completionRate={data.weeklyConsistency}
            familyMembers={data.totalMembers}
          />
        </Suspense>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left column */}
          <div className="space-y-5">
            {/* Family overview */}
            <FamilyOverview
              familyName={data.familyName}
              totalMembers={data.totalMembers}
              completedToday={data.completedToday}
              totalToday={data.totalToday}
              weeklyConsistency={data.weeklyConsistency}
              inviteCode={data.inviteCode}
            />

            {/* Member cards */}
            <div>
              <h2 className="text-sm font-semibold text-[#8b95a5] uppercase tracking-wider mb-3">
                Family Members
              </h2>
              <StaggerContainer className="space-y-3">
                {data.members.map((member) => (
                  <StaggerItem key={member.id}>
                    <MemberCard
                      name={member.name}
                      role={member.role}
                      todayStatus={member.todayStatus}
                      streak={member.streak}
                      completionRate={member.completionRate}
                      workoutName={member.workoutName}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Progress chart */}
            <ProgressChart />

            {/* Activity feed */}
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
