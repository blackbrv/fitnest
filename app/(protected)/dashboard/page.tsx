import { Suspense } from 'react'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/shared/Header'
import { WeeklyStats } from '@/components/dashboard/WeeklyStats'
import { FamilyOverview } from '@/components/dashboard/FamilyOverview'
import { MemberCard } from '@/components/dashboard/MemberCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
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
      include: {
        family: true,
        user: true,
      },
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

    const memberDataPromises = allMembers.map(async (m: (typeof allMembers)[number]) => {
      const todayLog = await db.workoutLog.findFirst({
        where: {
          userId: m.userId,
          createdAt: { gte: today, lte: todayEnd },
        },
        orderBy: { createdAt: 'desc' },
      })

      const weekLogs = await db.workoutLog.findMany({
        where: {
          userId: m.userId,
          createdAt: { gte: weekStart },
        },
      })

      const completedWeek = weekLogs.filter(
        (l: { status: string }) => l.status === 'COMPLETED',
      ).length
      const completionRate =
        weekLogs.length > 0
          ? Math.round((completedWeek / weekLogs.length) * 100)
          : 0

      let assignedWorkout = null
      if (todayLog?.workoutPlanId) {
        assignedWorkout = await db.workoutPlan.findUnique({
          where: { id: todayLog.workoutPlanId },
        })
      }

      return {
        id: m.userId,
        name: m.user?.name ?? 'Unknown',
        role: m.role as UserRole,
        streak: 0,
        completionRate,
        todayStatus: (todayLog?.status ?? null) as WorkoutStatus | null,
        workoutName: assignedWorkout?.title ?? null,
      }
    })

    const members = await Promise.all(memberDataPromises)

    const completedToday = members.filter(
      (m: MemberDashboardData) => m.todayStatus === 'COMPLETED',
    ).length

    return {
      familyName: familyMember.family.familyName,
      inviteCode: familyMember.family.inviteCode,
      totalMembers: allMembers.length,
      completedToday,
      totalToday: allMembers.length,
      weeklyConsistency: Math.round(
        members.reduce((sum: number, m: MemberDashboardData) => sum + m.completionRate, 0) / members.length,
      ),
      totalWorkoutsWeek: 0,
      activeStreak: 0,
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
              <div className="space-y-3">
                {data.members.map((member) => (
                  <MemberCard
                    key={member.id}
                    name={member.name}
                    role={member.role}
                    todayStatus={member.todayStatus}
                    streak={member.streak}
                    completionRate={member.completionRate}
                    workoutName={member.workoutName}
                  />
                ))}
              </div>
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
