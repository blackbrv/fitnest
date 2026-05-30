import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { WorkoutForm } from '@/components/workout/WorkoutForm'
import { FamilyMember, User } from '@/types'
import { ChevronLeft } from 'lucide-react'

type MemberWithUser = FamilyMember & { user: User }

export const metadata: Metadata = {
  title: 'New Workout Plan — FitNest',
}

async function getFamilyMembers(userId: string) {
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
    return membership?.family.members ?? []
  } catch {
    return []
  }
}

export default async function NewWorkoutPlanPage() {
  const session = await getSession()
  if (!session) return null

  const members = await getFamilyMembers(session.userId)

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/workout-plans"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Back to Plans
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Create Workout Plan</h1>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <WorkoutForm mode="create" familyMembers={members as unknown as MemberWithUser[]} />
    </div>
  )
}
