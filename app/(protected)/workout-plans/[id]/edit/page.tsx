import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { WorkoutForm } from '@/components/workout/WorkoutForm'
import { parseScheduledDays } from '@/lib/utils'
import { FamilyMember, User, WorkoutPlan } from '@/types'
import { ChevronLeft } from 'lucide-react'

type MemberWithUser = FamilyMember & { user: User }

export const metadata: Metadata = {
  title: 'Edit Workout Plan — FitNest',
}

async function getEditData(planId: string, userId: string) {
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
      include: { exercises: { orderBy: { order: 'asc' } } },
    })

    if (!plan || plan.familyId !== membership.familyId) return null

    return {
      plan: {
        ...plan,
        scheduledDays: parseScheduledDays(plan.scheduledDays as unknown as string),
      },
      members: membership.family.members,
      isOwner: membership.role === 'OWNER',
    }
  } catch {
    return null
  }
}

export default async function EditWorkoutPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const data = await getEditData(id, session.userId)
  if (!data) notFound()

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <Link
        href={`/workout-plans/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#8b95a5] hover:text-[#f5f7fa] transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Back to Plan
      </Link>

      <h1 className="text-2xl font-bold text-[#f5f7fa] mb-6">Edit Workout Plan</h1>

      <WorkoutForm
        mode="edit"
        plan={data.plan as unknown as WorkoutPlan}
        familyMembers={data.members as unknown as MemberWithUser[]}
      />
    </div>
  )
}
