import { Suspense } from 'react'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculateStreak, parseScheduledDays, formatRelativeTime } from '@/lib/utils'
import { Header } from '@/components/shared/Header'
import { WeeklyStats } from '@/components/dashboard/WeeklyStats'
import { FamilyOverview } from '@/components/dashboard/FamilyOverview'
import { MemberCard } from '@/components/dashboard/MemberCard'
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/ActivityFeed'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion'
import type { WorkoutStatus, UserRole } from '@/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

interface MemberDashboardData {
  id: string
  name: string
  role: UserRole
  streak: number
  completionRate: number
  todayStatus: WorkoutStatus | null
  workoutName: string | null
}

interface ChartDay {
  day: string
  completed: number
  total: number
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
  weeklyChartData: ChartDay[]
  recentActivity: ActivityItem[]
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
    { id: '1', name: 'Sarah Johnson', role: 'OWNER', streak: 12, completionRate: 87, todayStatus: 'COMPLETED', workoutName: 'Full Body Strength' },
    { id: '2', name: 'Marcus Johnson', role: 'MEMBER', streak: 7, completionRate: 74, todayStatus: 'COMPLETED', workoutName: 'HIIT Cardio Blast' },
    { id: '3', name: 'Emma Johnson', role: 'MEMBER', streak: 5, completionRate: 68, todayStatus: 'IN_PROGRESS', workoutName: 'Yoga & Mobility' },
    { id: '4', name: 'Liam Johnson', role: 'MEMBER', streak: 3, completionRate: 60, todayStatus: 'COMPLETED', workoutName: 'Kids Cardio Fun' },
    { id: '5', name: 'Olivia Johnson', role: 'MEMBER', streak: 0, completionRate: 40, todayStatus: 'PENDING', workoutName: 'Beginner Stretching' },
  ],
  weeklyChartData: [
    { day: 'Mon', completed: 4, total: 5 },
    { day: 'Tue', completed: 3, total: 5 },
    { day: 'Wed', completed: 5, total: 5 },
    { day: 'Thu', completed: 2, total: 5 },
    { day: 'Fri', completed: 4, total: 5 },
    { day: 'Sat', completed: 3, total: 5 },
    { day: 'Sun', completed: 1, total: 5 },
  ],
  recentActivity: [],
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
    const [allWeekLogs, allStreakLogs, allTodayLogs, recentCompletedLogs, activePlans] = await Promise.all([
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
      db.workoutLog.findMany({
        where: { userId: { in: memberUserIds }, status: 'COMPLETED', createdAt: { gte: weekStart } },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { workoutPlan: { select: { title: true } } },
      }),
      db.workoutPlan.findMany({
        where: { familyId: familyMember.familyId, isActive: true },
        select: { assignedTo: true, scheduledDays: true },
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

    // ── Weekly chart (last 7 days) ──────────────────────────────────────────
    const memberNameMap = new Map(allMembers.map((m: (typeof allMembers)[number]) => [m.userId, m.user?.name ?? 'Unknown']))

    const weeklyChartData: ChartDay[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today)
      day.setDate(today.getDate() - i)
      const dayStart = new Date(day)
      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)
      const dowIndex = day.getDay() // 0=Sun
      const dayKey = DAY_KEYS[dowIndex]

      const completedOnDay = (allWeekLogs as WeekLog[]).filter(
        (l) =>
          l.status === 'COMPLETED' &&
          new Date(l.createdAt) >= dayStart &&
          new Date(l.createdAt) <= dayEnd,
      ).length

      // Count members who have a plan scheduled on this day
      const scheduledMembers = new Set<string>()
      for (const plan of activePlans as { assignedTo: string | null; scheduledDays: string }[]) {
        const days = parseScheduledDays(plan.scheduledDays)
        if (days.includes(dayKey)) {
          if (plan.assignedTo) {
            scheduledMembers.add(plan.assignedTo)
          } else {
            memberUserIds.forEach((id) => scheduledMembers.add(id))
          }
        }
      }

      weeklyChartData.push({
        day: DAY_NAMES[dowIndex],
        completed: completedOnDay,
        total: scheduledMembers.size || memberUserIds.length,
      })
    }

    // ── Recent activity feed ────────────────────────────────────────────────
    const recentActivity: ActivityItem[] = (
      recentCompletedLogs as (typeof recentCompletedLogs[number])[]
    ).map((log) => ({
      id: log.id,
      memberName: memberNameMap.get(log.userId) ?? 'Someone',
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      detail: (log as any).workoutPlan?.title ?? 'a workout',
      timeAgo: formatRelativeTime(log.completedAt ?? log.createdAt),
      type: 'workout' as const,
    }))

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
      weeklyChartData,
      recentActivity,
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
                  className="rounded-2xl border border-border bg-surface p-4 h-[100px] animate-pulse"
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
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
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
            <ProgressChart data={data.weeklyChartData} />

            {/* Activity feed */}
            <ActivityFeed activities={data.recentActivity.length > 0 ? data.recentActivity : undefined} />
          </div>
        </div>
      </div>
    </div>
  )
}
