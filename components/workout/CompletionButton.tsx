'use client'

import { useState, useTransition } from 'react'
import { WorkoutStatus } from '@/types'
import { markWorkoutComplete } from '@/server/actions/workout'
import { cn } from '@/lib/utils'
import { CheckCircle2, Loader2, Trophy } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// ─── Inline styles for animations (no config needed in TailwindCSS v4) ────────

const KEYFRAMES = `
@keyframes scale-in {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(163, 255, 63, 0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(163, 255, 63, 0); }
}
`

interface CompletionButtonProps {
  workoutPlanId: string
  initialStatus?: WorkoutStatus | null
  completedAt?: Date | null
}

export function CompletionButton({
  workoutPlanId,
  initialStatus,
  completedAt,
}: CompletionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<WorkoutStatus>(initialStatus ?? 'PENDING')
  const [doneAt, setDoneAt] = useState<Date | null>(completedAt ?? null)
  const [justCompleted, setJustCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCompleted = status === 'COMPLETED'
  const isInProgress = status === 'IN_PROGRESS'

  async function handleComplete() {
    if (isCompleted || isPending) return
    setError(null)

    startTransition(async () => {
      const result = await markWorkoutComplete(workoutPlanId)
      if (result.success) {
        setStatus('COMPLETED')
        setDoneAt(new Date())
        setJustCompleted(true)
        setTimeout(() => setJustCompleted(false), 2000)
      } else {
        setError(result.error ?? 'Something went wrong.')
      }
    })
  }

  return (
    <>
      {/* Inject keyframe animations */}
      <style>{KEYFRAMES}</style>

      <div className="flex flex-col items-center gap-3 w-full">
        {isCompleted ? (
          // ── Completed state ──────────────────────────────────────────────
          <div
            className={cn(
              'w-full flex flex-col items-center gap-3 rounded-2xl p-6',
              'bg-emerald-500/10 border border-emerald-500/25',
              justCompleted && 'animate-[scale-in_0.35s_ease-out]',
            )}
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2
                  size={36}
                  className="text-emerald-400"
                  strokeWidth={1.75}
                  style={justCompleted ? { animation: 'scale-in 0.4s ease-out 0.1s both' } : {}}
                />
              </div>
              {justCompleted && (
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              )}
            </div>

            <div className="text-center">
              <p className="text-base font-bold text-emerald-400">Workout Completed!</p>
              {doneAt && (
                <p className="text-xs text-muted mt-1">
                  {formatDate(doneAt)} at{' '}
                  {doneAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400/70">
              <Trophy size={12} />
              <span>Keep up the great work!</span>
            </div>
          </div>
        ) : (
          // ── Pending / In-Progress state ──────────────────────────────────
          <button
            type="button"
            onClick={handleComplete}
            disabled={isPending}
            style={isPending ? {} : { animation: 'pulse-ring 2.5s ease-in-out infinite' }}
            className={cn(
              'w-full h-16 rounded-2xl font-bold text-base tracking-wide',
              'flex items-center justify-center gap-3 transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3ff3f]/50',
              isInProgress
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-[#a3ff3f] text-[#0f1115] hover:bg-[#7acc2e] active:scale-[0.98]',
              isPending && 'opacity-70 cursor-not-allowed',
            )}
          >
            {isPending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : isInProgress ? (
              <>
                <CheckCircle2 size={20} />
                Complete Workout
              </>
            ) : (
              <>
                <CheckCircle2 size={20} strokeWidth={2.5} />
                Complete Workout
              </>
            )}
          </button>
        )}

        {error && (
          <p className="text-xs text-red-400 text-center" role="alert">
            {error}
          </p>
        )}

        {!isCompleted && (
          <p className="text-xs text-muted text-center">
            Mark this workout as done for today
          </p>
        )}
      </div>
    </>
  )
}
