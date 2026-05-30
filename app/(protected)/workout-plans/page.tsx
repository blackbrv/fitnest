import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { WorkoutPlan, WorkoutStatus } from '@/types'
import { parseScheduledDays } from '@/lib/utils'
import { WorkoutPlanCard } from '@/components/workout/WorkoutPlanCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { StaggerContainer, StaggerItem } from '@/components/ui/Motion'
import { Dumbbell, Plus } from 'lucide-react'
import { FilterTabs } from './FilterTabs'

export const metadata: Metadata = {
  title: 'Workout Plans — FitNest',
}

// ─── Mock data fallback ───────────────────────────────────────────────────────

const MOCK_PLANS: (WorkoutPlan & {
  assignedMemberName?: string | null
  assignedMemberAvatar?: string | null
  todayStatus?: WorkoutStatus | null
  exerciseCount?: number
})[] = [
  {
    id: 'mock-1',
    familyId: 'fam-1',
    assignedTo: 'user-1',
    assignedMemberName: 'Alex Johnson',
    assignedMemberAvatar: null,
    title: 'Morning Strength Routine',
    description: 'A solid full-body strength session to kickstart the day.',
    difficulty: 'INTERMEDIATE',
    category: 'STRENGTH',
    scheduledDays: ['monday', 'wednesday', 'friday'],
    notes: null,
    isActive: true,
    exerciseCount: 5,
    todayStatus: 'PENDING',
    createdAt: new Date(),
  },
  {
    id: 'mock-2',
    familyId: 'fam-1',
    assignedTo: 'user-2',
    assignedMemberName: 'Sarah Johnson',
    assignedMemberAvatar: null,
    title: 'Evening Cardio Blast',
    description: 'High-intensity cardio to torch calories and improve endurance.',
    difficulty: 'ADVANCED',
    category: 'CARDIO',
    scheduledDays: ['tuesday', 'thursday', 'saturday'],
    notes: null,
    isActive: true,
    exerciseCount: 4,
    todayStatus: 'COMPLETED',
    createdAt: new Date(),
  },
  {
    id: 'mock-3',
    familyId: 'fam-1',
    assignedTo: null,
    assignedMemberName: null,
    assignedMemberAvatar: null,
    title: 'Family Yoga & Stretching',
    description: 'Gentle stretching for all ages. Great for recovery days.',
    difficulty: 'BEGINNER',
    category: 'STRETCHING',
    scheduledDays: ['sunday'],
    notes: 'Do together as a family!',
    isActive: true,
    exerciseCount: 6,
    todayStatus: null,
    createdAt: new Date(),
  },
  {
    id: 'mock-4',
    familyId: 'fam-1',
    assignedTo: 'user-3',
    assignedMemberName: 'Lily Johnson',
    assignedMemberAvatar: null,
    title: 'Kids Fun Workout',
    description: 'Playful exercises designed to keep kids active and happy.',
    difficulty: 'BEGINNER',
    category: 'KIDS_EXERCISE',
    scheduledDays: ['monday', 'wednesday', 'friday'],
    notes: null,
    isActive: true,
    exerciseCount: 7,
    todayStatus: 'PENDING',
    createdAt: new Date(),
  },
]

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getWorkoutPlans(userId: string) {
  try {
    const membership = await db.familyMember.findFirst({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
            },
          },
        },
      },
    })

    if (!membership) return { plans: [], isOwner: false, userId }

    const isOwner = membership.role === 'OWNER'

    const rawPlans = await db.workoutPlan.findMany({
      where: { familyId: membership.familyId, isActive: true },
      include: {
        exercises: { orderBy: { order: 'asc' } },
        workoutLogs: {
          where: {
            userId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    type MemberUser = { id: string; name: string; avatar: string | null }
    const memberMap = new Map<string, MemberUser>(
      membership.family.members.map((m) => [m.user.id, m.user as MemberUser]),
    )

    const plans = rawPlans.map((plan) => {
      const assignedUser = plan.assignedTo ? memberMap.get(plan.assignedTo) : null
      return {
        ...plan,
        scheduledDays: parseScheduledDays(plan.scheduledDays as unknown as string),
        assignedMemberName: assignedUser?.name ?? null,
        assignedMemberAvatar: assignedUser?.avatar ?? null,
        todayStatus: (plan.workoutLogs[0]?.status ?? null) as WorkoutStatus | null,
        exerciseCount: plan.exercises.length,
      }
    })

    return { plans, isOwner, userId }
  } catch (error) {
    console.error('[getWorkoutPlans]', error)
    return { plans: MOCK_PLANS, isOwner: true, userId }
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WorkoutPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await getSession()
  if (!session) return null

  const { filter } = await searchParams
  const activeFilter = (filter as 'all' | 'mine' | 'assigned') ?? 'all'

  const { plans, isOwner, userId } = await getWorkoutPlans(session.userId)

  const filteredPlans = plans.filter((plan) => {
    if (activeFilter === 'mine') return plan.assignedTo === userId
    if (activeFilter === 'assigned') return plan.assignedTo !== null
    return true
  })

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workout Plans</h1>
          <p className="text-sm text-muted mt-0.5">
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'} in your family
          </p>
        </div>

        {isOwner && (
          <Link
            href="/workout-plans/new"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#a3ff3f] text-[#0f1115] text-sm font-semibold hover:bg-[#7acc2e] transition-colors"
          >
            <Plus size={16} />
            Create Plan
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <FilterTabs activeFilter={activeFilter} />

      {/* Plans grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workout plans yet"
          description={
            activeFilter === 'mine'
              ? "No plans are assigned to you yet."
              : "Create your family's first workout plan to get started."
          }
          action={
            isOwner ? (
              <Link
                href="/workout-plans/new"
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl bg-[#a3ff3f] text-[#0f1115] text-sm font-semibold hover:bg-[#7acc2e] transition-colors"
              >
                <Plus size={14} />
                Create Plan
              </Link>
            ) : undefined
          }
          className="mt-4"
        />
      ) : (
        <StaggerContainer className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {filteredPlans.map((plan) => (
            <StaggerItem key={plan.id}>
              <WorkoutPlanCard plan={plan} currentUserId={userId} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}
