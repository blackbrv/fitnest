import { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ROUTES, MAX_FAMILY_MEMBERS } from '@/constants'
import { CreateFamilyForm } from '@/components/family/CreateFamilyForm'
import { JoinFamilyForm } from '@/components/family/JoinFamilyForm'
import { MemberList } from '@/components/family/MemberList'
import { FamilyStatsCard } from '@/components/family/FamilyStatsCard'
import { FamilyDashboard } from '@/components/family/FamilyDashboard'
import type { Family, FamilyMember, User } from '@/types'

export const metadata: Metadata = {
  title: 'FitNest — Family Management',
  description: 'Manage your family, invite members, and track your fitness together.',
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface FamilyMemberWithUser extends FamilyMember {
  user: User
}

interface FamilyData {
  family: Family
  members: FamilyMemberWithUser[]
  isOwner: boolean
}

// ── Mock data (DB fallback) ────────────────────────────────────────────────────

function getMockFamilyData(userId: string): FamilyData {
  const now = new Date()
  const mockFamily: Family = {
    id: 'mock-family-1',
    familyName: 'The Smiths',
    inviteCode: 'DEMO1234',
    ownerId: userId,
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  }
  const mockMembers: FamilyMemberWithUser[] = [
    {
      id: 'mock-member-1',
      familyId: 'mock-family-1',
      userId,
      role: 'OWNER',
      joinedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      user: {
        id: userId,
        name: 'You (Demo)',
        email: 'demo@example.com',
        avatar: null,
        emailVerified: true,
        createdAt: now,
      },
    },
    {
      id: 'mock-member-2',
      familyId: 'mock-family-1',
      userId: 'mock-user-2',
      role: 'MEMBER',
      joinedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      user: {
        id: 'mock-user-2',
        name: 'Alex Smith',
        email: 'alex@example.com',
        avatar: null,
        emailVerified: true,
        createdAt: now,
      },
    },
    {
      id: 'mock-member-3',
      familyId: 'mock-family-1',
      userId: 'mock-user-3',
      role: 'MEMBER',
      joinedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      user: {
        id: 'mock-user-3',
        name: 'Jordan Smith',
        email: 'jordan@example.com',
        avatar: null,
        emailVerified: true,
        createdAt: now,
      },
    },
  ]
  return { family: mockFamily, members: mockMembers, isOwner: true }
}

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getUserFamilyData(userId: string): Promise<FamilyData | null> {
  const membership = await db.familyMember.findFirst({
    where: { userId },
    include: {
      family: true,
      user: true,
    },
  })

  if (!membership) return null

  const allMembers = await db.familyMember.findMany({
    where: { familyId: membership.familyId },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })

  const family: Family = {
    id: membership.family.id,
    familyName: membership.family.familyName,
    inviteCode: membership.family.inviteCode,
    ownerId: membership.family.ownerId,
    createdAt: membership.family.createdAt,
  }

  const members: FamilyMemberWithUser[] = allMembers.map(
    (m: typeof allMembers[number]) => ({
      id: m.id,
      familyId: m.familyId,
      userId: m.userId,
      role: m.role as 'OWNER' | 'MEMBER',
      joinedAt: m.joinedAt,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar ?? null,
        emailVerified: m.user.emailVerified,
        createdAt: m.user.createdAt,
      },
    }),
  )

  return {
    family,
    members,
    isOwner: membership.role === 'OWNER',
  }
}

async function getWeeklyWorkouts(familyId: string): Promise<{ count: number; mostActiveMember: string }> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const logs = await db.workoutLog.findMany({
    where: {
      workoutPlan: { familyId },
      status: 'COMPLETED',
      completedAt: { gte: weekAgo },
    },
    include: { user: true },
  })

  const countByUser: Record<string, { name: string; count: number }> = {}
  for (const log of logs) {
    const key = log.userId
    if (!countByUser[key]) {
      countByUser[key] = { name: log.user.name, count: 0 }
    }
    countByUser[key].count++
  }

  let mostActiveMember = 'No workouts yet'
  let maxCount = 0
  for (const entry of Object.values(countByUser)) {
    if (entry.count > maxCount) {
      maxCount = entry.count
      mostActiveMember = entry.name
    }
  }

  return { count: logs.length, mostActiveMember }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function FamilyManagementPage() {
  const session = await getSession()
  if (!session) {
    redirect(ROUTES.LOGIN)
  }

  let familyData: FamilyData | null = null
  let weeklyWorkouts = 0
  let mostActiveMember = 'No workouts yet'
  let usingMockData = false

  try {
    familyData = await getUserFamilyData(session.userId)

    if (familyData) {
      const workoutStats = await getWeeklyWorkouts(familyData.family.id)
      weeklyWorkouts = workoutStats.count
      mostActiveMember = workoutStats.mostActiveMember
    }
  } catch (error) {
    console.error('[FamilyManagementPage] DB error — falling back to mock data:', error)
    familyData = getMockFamilyData(session.userId)
    weeklyWorkouts = 5
    mostActiveMember = 'Alex Smith'
    usingMockData = true
  }

  // ── No family: show onboarding ──────────────────────────────────────────────
  if (!familyData) {
    return (
      <div className="px-4 py-8 md:px-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Family Management</h1>
          <p className="text-muted text-sm mt-1">
            Create a new family or join an existing one with an invite code.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <CreateFamilyForm />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-muted text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
          <JoinFamilyForm />
        </div>
      </div>
    )
  }

  // ── Has family: show dashboard ──────────────────────────────────────────────
  const { family, members, isOwner } = familyData

  return (
    <div className="px-4 py-8 md:px-8 max-w-4xl mx-auto">
      {usingMockData && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          Demo mode — showing sample data (database unavailable).
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">{family.familyName}</h1>
          <p className="text-muted text-sm mt-1">
            {members.length} / {MAX_FAMILY_MEMBERS} members
          </p>
        </div>

        {/* Pass to client component for invite modal trigger + leave action */}
        <FamilyDashboard
          family={family}
          isOwner={isOwner}
          familyId={family.id}
        />
      </div>

      {/* Stats */}
      <div className="mb-6">
        <FamilyStatsCard
          totalMembers={members.length}
          weeklyWorkouts={weeklyWorkouts}
          mostActiveMember={mostActiveMember}
        />
      </div>

      {/* Members */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-foreground font-semibold text-base mb-5">Members</h2>
        <MemberList
          members={members}
          currentUserId={session.userId}
          isOwner={isOwner}
          familyId={family.id}
        />
      </div>
    </div>
  )
}
