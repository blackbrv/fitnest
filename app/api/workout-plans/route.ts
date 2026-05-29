import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxClient = any

// ─── Validation ───────────────────────────────────────────────────────────────

const createPlanSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  category: z.enum(['STRENGTH', 'CARDIO', 'STRETCHING', 'MOBILITY', 'KIDS_EXERCISE', 'RECOVERY']),
  scheduledDays: z.array(z.string()).min(1),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  exercises: z
    .array(
      z.object({
        exerciseName: z.string().min(1),
        sets: z.number().int().min(1),
        reps: z.number().int().min(1).nullable().optional(),
        duration: z.number().int().min(1).nullable().optional(),
        restSeconds: z.number().int().min(0).nullable().optional(),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
})

// ─── GET /api/workout-plans ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })

    if (!membership) {
      return Response.json({ data: [] }, { status: 200 })
    }

    const { searchParams } = request.nextUrl
    const assignedTo = searchParams.get('assignedTo')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    const plans = await db.workoutPlan.findMany({
      where: {
        familyId: membership.familyId,
        isActive: true,
        ...(assignedTo ? { assignedTo } : {}),
        ...(category ? { category: category as never } : {}),
        ...(difficulty ? { difficulty: difficulty as never } : {}),
      },
      include: {
        exercises: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ data: plans }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/workout-plans]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST /api/workout-plans ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createPlanSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })

    if (!membership) {
      return Response.json(
        { error: 'You must be in a family to create a workout plan.' },
        { status: 403 },
      )
    }

    const { exercises, ...planData } = parsed.data

    const plan = await db.$transaction(async (tx: TxClient) => {
      const created = await tx.workoutPlan.create({
        data: {
          familyId: membership.familyId,
          ...planData,
          isActive: true,
        },
      })

      await tx.workoutExercise.createMany({
        data: exercises.map((ex) => ({
          workoutPlanId: created.id,
          exerciseName: ex.exerciseName,
          sets: ex.sets,
          reps: ex.reps ?? null,
          duration: ex.duration ?? null,
          restSeconds: ex.restSeconds ?? null,
          order: ex.order,
        })),
      })

      return tx.workoutPlan.findUnique({
        where: { id: created.id },
        include: { exercises: { orderBy: { order: 'asc' } } },
      })
    })

    return Response.json({ data: plan }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/workout-plans]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
