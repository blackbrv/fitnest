'use client'

import { useState } from 'react'
import { WorkoutExercise } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, Timer, Repeat, Dumbbell } from 'lucide-react'

// ─── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise,
  index,
  total,
  onMoveUp,
  onMoveDown,
  reorderable,
}: {
  exercise: WorkoutExercise
  index: number
  total: number
  onMoveUp?: () => void
  onMoveDown?: () => void
  reorderable: boolean
}) {
  const hasDuration = exercise.duration != null && exercise.duration > 0
  const hasReps = exercise.reps != null && exercise.reps > 0

  function formatDuration(seconds: number) {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }

  return (
    <div className="bg-surface-2 rounded-xl p-3 flex items-center gap-3 group transition-colors hover:bg-surface-3">
      {/* Number */}
      <div className="shrink-0 h-7 w-7 rounded-lg bg-background flex items-center justify-center text-xs font-bold text-primary">
        {index + 1}
      </div>

      {/* Icon */}
      <div className="shrink-0 text-muted">
        <Dumbbell size={14} strokeWidth={1.75} />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{exercise.exerciseName}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {/* Sets × Reps */}
          {hasReps && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Repeat size={11} />
              {exercise.sets} × {exercise.reps} reps
            </span>
          )}
          {/* Sets × Duration */}
          {hasDuration && !hasReps && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Timer size={11} />
              {exercise.sets} × {formatDuration(exercise.duration!)}
            </span>
          )}
          {/* Sets only (no reps/duration) */}
          {!hasReps && !hasDuration && (
            <span className="text-xs text-muted">{exercise.sets} sets</span>
          )}
          {/* Rest */}
          {exercise.restSeconds != null && exercise.restSeconds > 0 && (
            <span className="text-xs text-muted">
              {formatDuration(exercise.restSeconds)} rest
            </span>
          )}
        </div>
      </div>

      {/* Reorder controls */}
      {reorderable && (
        <div className="shrink-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move exercise up"
            className={cn(
              'h-5 w-5 rounded flex items-center justify-center text-muted transition-colors',
              'hover:text-foreground hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move exercise down"
            className={cn(
              'h-5 w-5 rounded flex items-center justify-center text-muted transition-colors',
              'hover:text-foreground hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <ChevronDown size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ExerciseList ─────────────────────────────────────────────────────────────

interface ExerciseListProps {
  exercises: WorkoutExercise[]
  reorderable?: boolean
  onReorder?: (exercises: WorkoutExercise[]) => void
}

export function ExerciseList({ exercises, reorderable = false, onReorder }: ExerciseListProps) {
  const [items, setItems] = useState<WorkoutExercise[]>(
    [...exercises].sort((a, b) => a.order - b.order),
  )

  function move(from: number, to: number) {
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    const reindexed = next.map((ex, i) => ({ ...ex, order: i }))
    setItems(reindexed)
    onReorder?.(reindexed)
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
        <p className="text-sm text-muted">No exercises added yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((exercise, index) => (
        <ExerciseRow
          key={exercise.id}
          exercise={exercise}
          index={index}
          total={items.length}
          reorderable={reorderable}
          onMoveUp={() => move(index, index - 1)}
          onMoveDown={() => move(index, index + 1)}
        />
      ))}
    </div>
  )
}
