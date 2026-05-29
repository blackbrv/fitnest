import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseScheduledDays } from '@/lib/utils'
import { WorkoutPlan, WorkoutStatus, WorkoutExercise } from '@/types'
import { ExerciseList } from '@/components/workout/ExerciseList'
import { CompletionButton } from '@/components/workout/CompletionButton'
import { CategoryBadge } from '@/components/workout/CategoryBadge'
import { Avatar } from '@/components/ui/Avatar'
import { ChevronLeft, Calendar, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Difficulty styles ────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
  BEGINNER:     'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  INTERMEDIATE: 'bg-amber-500/15  text-amber-400  ring-1 ring-inset ring-amber-500/20',
  ADVANCED:     'bg-red-500/15    text-red-400    ring-1 ring-inset ring-red-500/20',
} as const

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

// ─── Mock data fallback ───────────────────────────────────────────────────────

const MOCK_PLAN: WorkoutPlan & {
  assignedMemberName?: string | null
  assignedMemberAvatar?: string | null
  todayStatus?: WorkoutStatus | null
  todayCompletedAt?: Date | null
} = {
  id: 'mock-1',
  familyId: 'fam-1',
  assignedTo: 'user-1',
  assignedMemberName: 'Alex Johnson',
  assignedMemberAvatar: null,
  title: 'Morning Strength Routine',
  description:
    'A solid full-body strength session to kickstart the day. Focus on form over weight.',
  difficulty: 'INTERMEDIATE',
  category: 'STRENGTH',
  scheduledDays: ['monday', 'wednesday', 'friday'],
  notes: 'Warm up with 5 minutes of light cardio first.',
  isActive: true,
  todayStatus: 'PENDING',
  todayCompletedAt: null,
  createdAt: new Date(),
  exercises: [
    { id: 'ex-1', workoutPlanId: 'mock-1', exerciseName: 'Barbell Squat', sets: 4, reps: 8, duration: null, restSeconds: 90, order: 0 },
    { id: 'ex-2', workoutPlanId: 'mock-1', exerciseName: 'Bench Press', sets: 4, reps: 8, duration: null, restSeconds: 90, order: 1 },
    { id: 'ex-3', workoutPlanId: 'mock-1', exerciseName: 'Deadlift', sets: 3, reps: 5, duration: null, restSeconds: 120, order: 2 },
    { id: 'ex-4', workoutPlanId: 'mock-1', exerciseName: 'Pull-ups', sets: 3, reps: 10, duration: null, restSeconds: 60, order: 3 },
    { id: 'ex-5', workoutPlanId: 'mock-1', exerciseName: 'Plank Hold', sets: 3, reps: null, duration: 60, restSeconds: 45, order: 4 },
  ] as WorkoutExercise[],
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getWorkoutPlan(planId: string, userId: string) {
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

    if (!membership) return null

    const plan = await db.workoutPlan.findUnique({
      where: { id: planId },
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
    })

    if (!plan || plan.familyId !== membership.familyId) return null

    type MemberUser = { id: string; name: string; avatar: string | null }
    const memberMap = new Map<string, MemberUser>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      membership.family.members.map((m: any) => [m.user.id as string, m.user as MemberUser]),
    )

    const assignedUser = plan.assignedTo ? memberMap.get(plan.assignedTo) : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todayLog = (plan as any).workoutLogs?.[0]

    return {
      ...plan,
      assignedMemberName: assignedUser?.name ?? null,
      assignedMemberAvatar: assignedUser?.avatar ?? null,
      todayStatus: (todayLog?.status ?? null) as WorkoutStatus | null,
      todayCompletedAt: todayLog?.completedAt ?? null,
      isOwner: membership.role === 'OWNER',
    }
  } catch (error) {
    console.error('[getWorkoutPlan]', error)
    return { ...MOCK_PLAN, isOwner: true }
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return { title: `Workout Plan — FitNest` }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WorkoutPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  // Support "mock-1" in dev for demo
  const plan = id.startsWith('mock-')
    ? { ...MOCK_PLAN, isOwner: true }
    : await getWorkoutPlan(id, session.userId)

  if (!plan) notFound()

  const isAssignedToMe = plan.assignedTo === session.userId
  const canComplete = isAssignedToMe || plan.assignedTo === null

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Back + edit */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/workout-plans"
          className="inline-flex items-center gap-1.5 text-sm text-[#8b95a5] hover:text-[#f5f7fa] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Plans
        </Link>

        {'isOwner' in plan && plan.isOwner && (
          <Link
            href={`/workout-plans/${plan.id}/edit`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#1c2433] text-[#f5f7fa] text-sm border border-white/8 hover:bg-[#242e40] transition-colors"
          >
            <Edit2 size={13} />
            Edit
          </Link>
        )}
      </div>

      {/* Plan header */}
      <div className="rounded-2xl bg-[#151922] border border-white/8 p-6 mb-5">
        <div className="flex items-start gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#f5f7fa] mb-2">{plan.title}</h1>
            <div className="flex items-center flex-wrap gap-2">
              <CategoryBadge category={plan.category} showDot />
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  DIFFICULTY_STYLES[plan.difficulty as keyof typeof DIFFICULTY_STYLES],
                )}
              >
                {plan.difficulty.charAt(0) + plan.difficulty.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {plan.description && (
          <p className="text-sm text-[#8b95a5] mb-4">{plan.description}</p>
        )}

        {/* Scheduled days */}
        <div className="flex items-start gap-3 mb-4">
          <Calendar size={15} className="text-[#8b95a5] mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {parseScheduledDays(plan.scheduledDays as unknown as string).map((day: string) => (
              <span
                key={day}
                className="bg-[#a3ff3f]/15 text-[#a3ff3f] text-xs px-2 py-0.5 rounded-md font-medium"
              >
                {DAY_LABELS[day] ?? day}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned member */}
        {'assignedMemberName' in plan && plan.assignedMemberName && (
          <div className="flex items-center gap-2 pt-4 border-t border-white/6">
            <span className="text-xs text-[#8b95a5]">Assigned to</span>
            <Avatar
              src={('assignedMemberAvatar' in plan ? plan.assignedMemberAvatar : null) as string | null}
              name={plan.assignedMemberName as string}
              size="sm"
            />
            <span className="text-sm font-medium text-[#f5f7fa]">{plan.assignedMemberName as string}</span>
            {isAssignedToMe && (
              <span className="text-xs text-[#a3ff3f] bg-[#a3ff3f]/10 px-2 py-0.5 rounded-full">
                You
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {plan.notes && (
          <div className="mt-4 pt-4 border-t border-white/6">
            <p className="text-xs text-[#8b95a5] font-medium mb-1">Notes</p>
            <p className="text-sm text-[#f5f7fa]">{plan.notes}</p>
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="rounded-2xl bg-[#151922] border border-white/8 p-5 mb-5">
        <h2 className="text-sm font-semibold text-[#f5f7fa] mb-4">
          Exercises{' '}
          <span className="text-[#8b95a5] font-normal">
            ({plan.exercises?.length ?? 0})
          </span>
        </h2>
        <ExerciseList exercises={(plan.exercises ?? []) as WorkoutExercise[]} />
      </div>

      {/* Completion button (only show for assigned user or family-wide plans) */}
      {canComplete && (
        <div className="rounded-2xl bg-[#151922] border border-white/8 p-5">
          <h2 className="text-sm font-semibold text-[#f5f7fa] mb-4">Today&apos;s Status</h2>
          <CompletionButton
            workoutPlanId={plan.id}
            initialStatus={('todayStatus' in plan ? plan.todayStatus : null) as WorkoutStatus | null}
            completedAt={('todayCompletedAt' in plan ? plan.todayCompletedAt : null) as Date | null}
          />
        </div>
      )}
    </div>
  )
}
