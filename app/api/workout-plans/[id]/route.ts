import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseScheduledDays } from '@/lib/utils'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

const patchSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  category: z
    .enum(['STRENGTH', 'CARDIO', 'STRETCHING', 'MOBILITY', 'KIDS_EXERCISE', 'RECOVERY'])
    .optional(),
  scheduledDays: z.array(z.string()).min(1).optional(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

async function getOwnerMembership(userId: string) {
  return db.familyMember.findFirst({
    where: { userId },
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const { id } = await params

    const membership = await getOwnerMembership(session.userId)

    const plan = await db.workoutPlan.findUnique({
      where: { id },
      include: { exercises: { orderBy: { order: 'asc' } } },
    })

    if (!plan || !membership || plan.familyId !== membership.familyId) {
      return err('Workout plan not found', 404)
    }

    const scheduledDays = parseScheduledDays(plan.scheduledDays as unknown as string)

    return Response.json(
      { data: { ...plan, scheduledDays } },
      { status: 200 },
    )
  } catch (error) {
    console.error('[GET /api/workout-plans/[id]]', error)
    return err('Internal server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const { id } = await params

    const membership = await getOwnerMembership(session.userId)

    if (!membership || membership.role !== 'OWNER') {
      return err('Forbidden', 403)
    }

    const plan = await db.workoutPlan.findUnique({ where: { id } })
    if (!plan || plan.familyId !== membership.familyId) {
      return err('Workout plan not found', 404)
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { scheduledDays, ...rest } = parsed.data
    const updateData: Record<string, unknown> = { ...rest }
    if (scheduledDays !== undefined) {
      updateData.scheduledDays = JSON.stringify(scheduledDays)
    }

    const updated = await db.workoutPlan.update({
      where: { id },
      data: updateData,
      include: { exercises: { orderBy: { order: 'asc' } } },
    })

    const parsedDays = parseScheduledDays(updated.scheduledDays as unknown as string)

    return Response.json(
      { data: { ...updated, scheduledDays: parsedDays } },
      { status: 200 },
    )
  } catch (error) {
    console.error('[PATCH /api/workout-plans/[id]]', error)
    return err('Internal server error', 500)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const { id } = await params

    const membership = await getOwnerMembership(session.userId)

    if (!membership || membership.role !== 'OWNER') {
      return err('Forbidden', 403)
    }

    const plan = await db.workoutPlan.findUnique({ where: { id } })
    if (!plan || plan.familyId !== membership.familyId) {
      return err('Workout plan not found', 404)
    }

    await db.workoutPlan.delete({ where: { id } })

    return Response.json({ data: { message: 'Workout plan deleted' } }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/workout-plans/[id]]', error)
    return err('Internal server error', 500)
  }
}
