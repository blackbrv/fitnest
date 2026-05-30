import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// ─── Validation ───────────────────────────────────────────────────────────────

const workoutStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'])

const createLogSchema = z.object({
  workoutPlanId: z.string().min(1, 'workoutPlanId is required'),
  status: workoutStatusEnum,
  notes: z.string().max(500).optional().nullable(),
})

const getLogsQuerySchema = z.object({
  workoutPlanId: z.string().optional(),
  status: workoutStatusEnum.optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
})

// ─── GET /api/workout-logs ────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const queryParsed = getLogsQuerySchema.safeParse({
      workoutPlanId: searchParams.get('workoutPlanId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    })
    if (!queryParsed.success) {
      return Response.json(
        { error: 'Invalid query parameters', details: queryParsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { workoutPlanId, status, from, to } = queryParsed.data

    const logs = await db.workoutLog.findMany({
      where: {
        userId: session.userId,
        ...(workoutPlanId ? { workoutPlanId } : {}),
        ...(status ? { status } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      include: {
        workoutPlan: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ data: logs }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/workout-logs]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST /api/workout-logs ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createLogSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { workoutPlanId, status, notes } = parsed.data

    // Verify the workout plan belongs to the user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })
    if (!membership) {
      return Response.json({ error: 'You must be in a family.' }, { status: 403 })
    }

    const plan = await db.workoutPlan.findUnique({ where: { id: workoutPlanId } })
    if (!plan || plan.familyId !== membership.familyId) {
      return Response.json({ error: 'Workout plan not found or access denied.' }, { status: 404 })
    }

    // Upsert: find today's log or create a new one
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 86400000)

    const existing = await db.workoutLog.findFirst({
      where: {
        userId: session.userId,
        workoutPlanId,
        createdAt: { gte: today, lt: tomorrow },
      },
    })

    const log = existing
      ? await db.workoutLog.update({
          where: { id: existing.id },
          data: {
            status,
            notes: notes ?? existing.notes,
            completedAt: status === 'COMPLETED' ? new Date() : existing.completedAt,
          },
        })
      : await db.workoutLog.create({
          data: {
            userId: session.userId,
            workoutPlanId,
            status,
            notes: notes ?? null,
            completedAt: status === 'COMPLETED' ? new Date() : null,
          },
        })

    return Response.json({ data: log }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('[POST /api/workout-logs]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
