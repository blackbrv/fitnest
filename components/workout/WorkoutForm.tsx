'use client'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createWorkoutPlan, updateWorkoutPlan } from '@/server/actions/workout'
import { WorkoutPlan, FamilyMember } from '@/types'
import { WORKOUT_CATEGORIES, WORKOUT_DIFFICULTIES, DAYS_OF_WEEK } from '@/constants'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react'

// ─── Schema (mirrors server-side schema) ─────────────────────────────────────

const exerciseSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z.coerce.number().int().min(1, 'At least 1 set'),
  reps: z.coerce.number().int().min(1).nullable().optional(),
  duration: z.coerce.number().int().min(1).nullable().optional(),
  restSeconds: z.coerce.number().int().min(0).nullable().optional(),
  order: z.number().int().min(0),
})

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  category: z.enum(['STRENGTH', 'CARDIO', 'STRETCHING', 'MOBILITY', 'KIDS_EXERCISE', 'RECOVERY']),
  scheduledDays: z.array(z.string()).min(1, 'Select at least one scheduled day'),
  assignedTo: z.string().optional(),
  notes: z.string().max(500).optional(),
  exercises: z.array(exerciseSchema).min(1, 'Add at least one exercise'),
})

type FormValues = z.infer<typeof formSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkoutFormProps {
  mode?: 'create' | 'edit'
  plan?: WorkoutPlan
  familyMembers?: (FamilyMember & { user: { id: string; name: string; avatar?: string | null } })[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkoutForm({ mode = 'create', plan, familyMembers = [] }: WorkoutFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: plan?.title ?? '',
      description: plan?.description ?? '',
      difficulty: plan?.difficulty ?? 'BEGINNER',
      category: plan?.category ?? 'STRENGTH',
      scheduledDays: plan?.scheduledDays ?? [],
      assignedTo: plan?.assignedTo ?? 'none',
      notes: plan?.notes ?? '',
      exercises: plan?.exercises
        ? plan.exercises.map((ex) => ({
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            reps: ex.reps ?? undefined,
            duration: ex.duration ?? undefined,
            restSeconds: ex.restSeconds ?? undefined,
            order: ex.order,
          }))
        : [{ exerciseName: '', sets: 3, reps: 10, duration: undefined, restSeconds: 60, order: 0 }],
    },
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'exercises' })

  const scheduledDays = watch('scheduledDays')

  function toggleDay(day: string) {
    const current = scheduledDays ?? []
    setValue(
      'scheduledDays',
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
      { shouldValidate: true },
    )
  }

  function addExercise() {
    append({
      exerciseName: '',
      sets: 3,
      reps: 10,
      duration: undefined,
      restSeconds: 60,
      order: fields.length,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(values: any) {
    setServerError(null)

    // Manual client-side validation
    const parsed = formSchema.safeParse(values)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      setServerError(firstIssue.message)
      return
    }

    const validValues = parsed.data

    startTransition(async () => {
      // Assign order based on field array index
      const payload = {
        ...validValues,
        exercises: validValues.exercises.map(
          (ex: FormValues['exercises'][number], i: number) => ({ ...ex, order: i }),
        ),
        assignedTo: (validValues.assignedTo && validValues.assignedTo !== 'none') ? validValues.assignedTo : undefined,
        description: validValues.description || undefined,
        notes: validValues.notes || undefined,
      }

      const result =
        mode === 'edit' && plan
          ? await updateWorkoutPlan(plan.id, payload)
          : await createWorkoutPlan(payload)

      if (!result.success) {
        setServerError(result.error ?? 'Something went wrong.')
      } else if (mode === 'edit') {
        router.push('/workout-plans')
      }
      // For create: server action calls redirect() itself
    })
  }

  const memberOptions = [
    { value: 'none', label: 'No one (family-wide)' },
    ...familyMembers.map((m) => ({ value: m.user.id, label: m.user.name })),
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* ── Basic info ─────────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Plan Details</h2>

        <Input
          label="Title"
          placeholder="e.g. Morning Strength Routine"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Briefly describe this workout plan…"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label="Category"
                options={WORKOUT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.category?.message}
              />
            )}
          />

          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <Select
                label="Difficulty"
                options={WORKOUT_DIFFICULTIES.map((d) => ({ value: d.value, label: d.label }))}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.difficulty?.message}
              />
            )}
          />
        </div>

        {familyMembers.length > 0 && (
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <Select
                label="Assign to Member"
                options={memberOptions}
                value={field.value ?? 'none'}
                onValueChange={field.onChange}
                error={errors.assignedTo?.message}
              />
            )}
          />
        )}
      </section>

      {/* ── Scheduled days ─────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Scheduled Days</h2>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const active = (scheduledDays ?? []).includes(day.value)
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3ff3f]/50',
                  active
                    ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                    : 'bg-surface-2 text-muted hover:text-foreground hover:bg-surface-3',
                )}
              >
                {day.label}
              </button>
            )
          })}
        </div>
        {errors.scheduledDays && (
          <p className="text-xs text-red-400" role="alert">
            {errors.scheduledDays.message}
          </p>
        )}
      </section>

      {/* ── Exercises ──────────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Exercises{' '}
            <span className="text-muted font-normal">({fields.length})</span>
          </h2>
          <Button type="button" variant="secondary" size="sm" onClick={addExercise}>
            <Plus size={14} />
            Add Exercise
          </Button>
        </div>

        {errors.exercises?.root && (
          <p className="text-xs text-red-400" role="alert">
            {errors.exercises.root.message}
          </p>
        )}
        {errors.exercises?.message && (
          <p className="text-xs text-red-400" role="alert">
            {errors.exercises.message}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-surface-2 rounded-xl p-4 border border-white/5 flex flex-col gap-3"
            >
              {/* Exercise header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-muted" />
                  <span className="text-xs font-bold text-primary">#{index + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  aria-label="Remove exercise"
                  className={cn(
                    'h-7 w-7 rounded-lg flex items-center justify-center transition-colors',
                    'text-muted hover:text-red-400 hover:bg-red-500/10',
                    'disabled:opacity-30 disabled:cursor-not-allowed',
                  )}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Exercise name */}
              <Input
                placeholder="Exercise name"
                error={errors.exercises?.[index]?.exerciseName?.message}
                {...register(`exercises.${index}.exerciseName`)}
              />

              {/* Sets / Reps / Duration / Rest */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Input
                  label="Sets"
                  type="number"
                  min={1}
                  placeholder="3"
                  error={errors.exercises?.[index]?.sets?.message}
                  {...register(`exercises.${index}.sets`)}
                />
                <Input
                  label="Reps"
                  type="number"
                  min={1}
                  placeholder="10"
                  error={errors.exercises?.[index]?.reps?.message}
                  {...register(`exercises.${index}.reps`)}
                />
                <Input
                  label="Duration (s)"
                  type="number"
                  min={1}
                  placeholder="30"
                  error={errors.exercises?.[index]?.duration?.message}
                  {...register(`exercises.${index}.duration`)}
                />
                <Input
                  label="Rest (s)"
                  type="number"
                  min={0}
                  placeholder="60"
                  error={errors.exercises?.[index]?.restSeconds?.message}
                  {...register(`exercises.${index}.restSeconds`)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Notes ──────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Notes</h2>
        <Textarea
          placeholder="Any additional notes or instructions…"
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </section>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/workout-plans')}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          {mode === 'edit' ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>
    </form>
  )
}
