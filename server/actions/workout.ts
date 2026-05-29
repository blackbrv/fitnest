'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ActionResult, WorkoutPlan, WorkoutLog } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxClient = any

// ─── Validation Schemas ───────────────────────────────────────────────────────

const exerciseSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z.number().int().min(1, 'Sets must be at least 1'),
  reps: z.number().int().min(1).nullable().optional(),
  duration: z.number().int().min(1).nullable().optional(),
  restSeconds: z.number().int().min(0).nullable().optional(),
  order: z.number().int().min(0),
})

const createWorkoutPlanSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  category: z.enum(['STRENGTH', 'CARDIO', 'STRETCHING', 'MOBILITY', 'KIDS_EXERCISE', 'RECOVERY']),
  scheduledDays: z.array(z.string()).min(1, 'Select at least one day'),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  exercises: z.array(exerciseSchema).min(1, 'Add at least one exercise'),
})

const updateWorkoutPlanSchema = createWorkoutPlanSchema.partial()

// ─── createWorkoutPlan ────────────────────────────────────────────────────────

export async function createWorkoutPlan(
  formData: z.infer<typeof createWorkoutPlanSchema>,
): Promise<ActionResult<WorkoutPlan>> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in.' }
  }

  const parsed = createWorkoutPlanSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { title, description, difficulty, category, scheduledDays, assignedTo, notes, exercises } =
    parsed.data

  try {
    // Resolve user's family
    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })

    if (!membership) {
      return { success: false, error: 'You must be in a family to create a workout plan.' }
    }

    const plan = await db.$transaction(async (tx: TxClient) => {
      const created = await tx.workoutPlan.create({
        data: {
          familyId: membership.familyId,
          title,
          description: description ?? null,
          difficulty,
          category,
          scheduledDays,
          assignedTo: assignedTo ?? null,
          notes: notes ?? null,
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

    revalidatePath('/workout-plans')
    redirect('/workout-plans')

    // Note: redirect() throws — the return below is for TypeScript only
    return { success: true, data: plan as unknown as WorkoutPlan }
  } catch (error) {
    // redirect() throws a special error — re-throw it so Next.js handles it
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof (error as { digest: unknown }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error
    }
    console.error('[createWorkoutPlan]', error)
    return { success: false, error: 'Failed to create workout plan. Please try again.' }
  }
}

// ─── updateWorkoutPlan ────────────────────────────────────────────────────────

export async function updateWorkoutPlan(
  planId: string,
  formData: z.infer<typeof updateWorkoutPlanSchema>,
): Promise<ActionResult<WorkoutPlan>> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in.' }
  }

  const parsed = updateWorkoutPlanSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    // Verify ownership: user must belong to the family that owns this plan
    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })
    if (!membership) {
      return { success: false, error: 'You must be in a family.' }
    }

    const plan = await db.workoutPlan.findUnique({ where: { id: planId } })
    if (!plan || plan.familyId !== membership.familyId) {
      return { success: false, error: 'Workout plan not found or access denied.' }
    }

    const { exercises, ...planData } = parsed.data

    const updated = await db.$transaction(async (tx: TxClient) => {
      const p = await tx.workoutPlan.update({
        where: { id: planId },
        data: {
          ...(planData.title !== undefined && { title: planData.title }),
          ...(planData.description !== undefined && { description: planData.description }),
          ...(planData.difficulty !== undefined && { difficulty: planData.difficulty }),
          ...(planData.category !== undefined && { category: planData.category }),
          ...(planData.scheduledDays !== undefined && { scheduledDays: planData.scheduledDays }),
          ...(planData.assignedTo !== undefined && { assignedTo: planData.assignedTo }),
          ...(planData.notes !== undefined && { notes: planData.notes }),
        },
      })

      if (exercises && exercises.length > 0) {
        await tx.workoutExercise.deleteMany({ where: { workoutPlanId: planId } })
        await tx.workoutExercise.createMany({
          data: exercises.map((ex) => ({
            workoutPlanId: planId,
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps ?? null,
            duration: ex.duration ?? null,
            restSeconds: ex.restSeconds ?? null,
            order: ex.order,
          })),
        })
      }

      return tx.workoutPlan.findUnique({
        where: { id: p.id },
        include: { exercises: { orderBy: { order: 'asc' } } },
      })
    })

    revalidatePath('/workout-plans')
    revalidatePath(`/workout-plans/${planId}`)

    return { success: true, data: updated as unknown as WorkoutPlan }
  } catch (error) {
    console.error('[updateWorkoutPlan]', error)
    return { success: false, error: 'Failed to update workout plan. Please try again.' }
  }
}

// ─── markWorkoutComplete ──────────────────────────────────────────────────────

export async function markWorkoutComplete(
  workoutPlanId: string,
  notes?: string,
): Promise<ActionResult<WorkoutLog>> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in.' }
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 86400000)

    // Find or create log for today
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
            status: 'COMPLETED',
            completedAt: new Date(),
            notes: notes ?? existing.notes,
          },
        })
      : await db.workoutLog.create({
          data: {
            userId: session.userId,
            workoutPlanId,
            status: 'COMPLETED',
            completedAt: new Date(),
            notes: notes ?? null,
          },
        })

    revalidatePath('/workout-plans')
    revalidatePath(`/workout-plans/${workoutPlanId}`)
    revalidatePath('/dashboard')

    return { success: true, data: log as unknown as WorkoutLog }
  } catch (error) {
    console.error('[markWorkoutComplete]', error)
    return { success: false, error: 'Failed to mark workout as complete. Please try again.' }
  }
}

// ─── deleteWorkoutPlan ────────────────────────────────────────────────────────

export async function deleteWorkoutPlan(planId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in.' }
  }

  try {
    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })
    if (!membership) {
      return { success: false, error: 'You must be in a family.' }
    }

    const plan = await db.workoutPlan.findUnique({ where: { id: planId } })
    if (!plan || plan.familyId !== membership.familyId) {
      return { success: false, error: 'Workout plan not found or access denied.' }
    }

    await db.workoutPlan.delete({ where: { id: planId } })

    revalidatePath('/workout-plans')
    return { success: true }
  } catch (error) {
    console.error('[deleteWorkoutPlan]', error)
    return { success: false, error: 'Failed to delete workout plan. Please try again.' }
  }
}
