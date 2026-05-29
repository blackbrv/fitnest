import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROUTES } from '@/constants'
import { StatsOverview } from '@/components/statistics/StatsOverview'
import { WeeklyChart } from '@/components/statistics/WeeklyChart'
import { MonthlyChart } from '@/components/statistics/MonthlyChart'
import { FamilyLeaderboard } from '@/components/statistics/FamilyLeaderboard'
import { ConsistencyCalendar } from '@/components/statistics/ConsistencyCalendar'
import { calculateCompletionRate, calculateStreak } from '@/lib/utils'

const mockWeeklyData = [
  { day: 'Mon', completed: 3 },
  { day: 'Tue', completed: 5 },
  { day: 'Wed', completed: 2 },
  { day: 'Thu', completed: 4 },
  { day: 'Fri', completed: 5 },
  { day: 'Sat', completed: 1 },
  { day: 'Sun', completed: 3 },
]

function generateMockMonthlyData() {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    data.push({
      date: label,
      completed: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0,
    })
  }
  return data
}

const mockMonthlyData = generateMockMonthlyData()

const mockFamilyMembers = [
  { id: '1', name: 'Alex Johnson', streak: 12, completionRate: 87 },
  { id: '2', name: 'Sarah Johnson', streak: 7, completionRate: 74 },
  { id: '3', name: 'Mike Johnson', streak: 3, completionRate: 61 },
  { id: '4', name: 'Emma Johnson', streak: 5, completionRate: 55 },
]

function generateMockCalendarLogs() {
  const logs = []
  const today = new Date()
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (Math.random() > 0.35) {
      logs.push({ date: d.toISOString(), completed: true })
    }
  }
  return logs
}

export default async function StatisticsPage() {
  const session = await getSession()
  if (!session) redirect(ROUTES.LOGIN)

  // --- Fetch user stats ---
  let workoutsCompleted = 0
  let totalActiveDays = 0
  let currentStreak = 0
  let consistencyRate = 0
  let weeklyData = mockWeeklyData
  let monthlyData = mockMonthlyData
  let familyMembers = mockFamilyMembers
  let calendarLogs = generateMockCalendarLogs()

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    type DbLog = { userId: string; completedAt: Date | null }
    const [logs, allLogs]: [DbLog[], DbLog[]] = await Promise.all([
      db.workoutLog.findMany({
        where: { userId: session.userId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 500,
      }),
      db.workoutLog.findMany({
        where: {
          userId: session.userId,
          status: 'COMPLETED',
          completedAt: { gte: ninetyDaysAgo },
        },
        orderBy: { completedAt: 'asc' },
      }),
    ])

    workoutsCompleted = logs.length

    // Compute active days (distinct days with completions)
    const daySet = new Set<string>()
    for (const log of logs) {
      if (log.completedAt) {
        const d = new Date(log.completedAt)
        daySet.add(d.toISOString().slice(0, 10))
      }
    }
    totalActiveDays = daySet.size

    // Streak
    const completedDates = logs
      .filter((l) => l.completedAt)
      .map((l) => new Date(l.completedAt!))
    currentStreak = calculateStreak(completedDates)

    // 30-day consistency
    const recentLogs = logs.filter(
      (l) => l.completedAt && new Date(l.completedAt) >= thirtyDaysAgo,
    )
    const recentDaySet = new Set<string>()
    for (const log of recentLogs) {
      if (log.completedAt) {
        recentDaySet.add(new Date(log.completedAt).toISOString().slice(0, 10))
      }
    }
    consistencyRate = calculateCompletionRate(recentDaySet.size, 30)

    // Weekly chart data
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weekLogs = logs.filter(
      (l) => l.completedAt && new Date(l.completedAt) >= sevenDaysAgo,
    )
    const weekMap: Record<string, number> = {}
    for (const log of weekLogs) {
      if (log.completedAt) {
        const d = new Date(log.completedAt)
        const key = dayOfWeek[d.getDay()]
        weekMap[key] = (weekMap[key] ?? 0) + 1
      }
    }
    if (weekLogs.length > 0) {
      weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
        day: d,
        completed: weekMap[d] ?? 0,
      }))
    }

    // Monthly chart data
    if (allLogs.length > 0) {
      const monthMap: Record<string, number> = {}
      for (const log of allLogs) {
        if (log.completedAt) {
          const d = new Date(log.completedAt)
          const label = `${d.getMonth() + 1}/${d.getDate()}`
          monthMap[label] = (monthMap[label] ?? 0) + 1
        }
      }
      const today = new Date()
      const monthly = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const label = `${d.getMonth() + 1}/${d.getDate()}`
        monthly.push({ date: label, completed: monthMap[label] ?? 0 })
      }
      monthlyData = monthly
    }

    // Calendar logs
    calendarLogs = allLogs
      .filter((l) => l.completedAt)
      .map((l) => ({ date: l.completedAt!.toISOString(), completed: true }))

    // Family leaderboard
    const familyMember = await db.familyMember.findFirst({
      where: { userId: session.userId },
      include: { family: { include: { members: { include: { user: true } } } } },
    })

    type DbMember = { userId: string; user?: { name: string; avatar?: string | null } | null }
    const members: DbMember[] = familyMember?.family?.members ?? []
    if (members.length > 0) {
      const memberIds = members.map((m) => m.userId)
      const memberLogs: DbLog[] = await db.workoutLog.findMany({
        where: {
          userId: { in: memberIds },
          status: 'COMPLETED',
          completedAt: { gte: thirtyDaysAgo },
        },
      })

      familyMembers = members.map((m) => {
        const mLogs = memberLogs.filter((l) => l.userId === m.userId)
        const mDays = new Set(
          mLogs
            .filter((l) => l.completedAt)
            .map((l) => new Date(l.completedAt!).toISOString().slice(0, 10)),
        )
        const mStreak = calculateStreak(
          mLogs.filter((l) => l.completedAt).map((l) => new Date(l.completedAt!)),
        )
        return {
          id: m.userId,
          name: m.user?.name ?? 'Member',
          avatar: m.user?.avatar ?? null,
          streak: mStreak,
          completionRate: calculateCompletionRate(mDays.size, 30),
        }
      })
    }
  } catch {
    // Fall through to mock data
  }

  return (
    <div className="p-5 lg:p-7 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f5f7fa]">Statistics</h1>
        <p className="mt-1 text-sm text-[#8b95a5]">
          Your personal performance and family activity overview
        </p>
      </div>

      {/* Key stat cards */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-white/8 bg-[#151922] animate-pulse"
              />
            ))}
          </div>
        }
      >
        <StatsOverview
          workoutsCompleted={workoutsCompleted}
          totalActiveDays={totalActiveDays}
          currentStreak={currentStreak}
          consistencyRate={consistencyRate}
        />
      </Suspense>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekly bar chart */}
        <div className="rounded-2xl border border-white/8 bg-[#151922] p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#f5f7fa]">Weekly Activity</h2>
            <p className="text-xs text-[#8b95a5] mt-0.5">Workouts completed per day this week</p>
          </div>
          <WeeklyChart data={weeklyData} />
        </div>

        {/* Monthly area chart */}
        <div className="rounded-2xl border border-white/8 bg-[#151922] p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#f5f7fa]">30-Day Trend</h2>
            <p className="text-xs text-[#8b95a5] mt-0.5">Daily workout completion over the last month</p>
          </div>
          <MonthlyChart data={monthlyData} />
        </div>
      </div>

      {/* Consistency calendar */}
      <div className="rounded-2xl border border-white/8 bg-[#151922] p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#f5f7fa]">Consistency Calendar</h2>
          <p className="text-xs text-[#8b95a5] mt-0.5">Your workout activity over the last 3 months</p>
        </div>
        <ConsistencyCalendar logs={calendarLogs} />
      </div>

      {/* Family leaderboard */}
      <div className="rounded-2xl border border-white/8 bg-[#151922] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#f5f7fa]">Family Leaderboard</h2>
            <p className="text-xs text-[#8b95a5] mt-0.5">Ranked by 30-day consistency rate</p>
          </div>
          <span className="rounded-full bg-[#a3ff3f]/10 px-3 py-1 text-xs font-semibold text-[#a3ff3f]">
            {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'}
          </span>
        </div>
        <FamilyLeaderboard members={familyMembers} />
      </div>
    </div>
  )
}
