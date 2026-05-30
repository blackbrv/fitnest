import Link from 'next/link'
import { WorkoutPlan, WorkoutStatus } from '@/types'
import { cn, parseScheduledDays } from '@/lib/utils'
import { CategoryBadge } from './CategoryBadge'
import { Avatar } from '@/components/ui/Avatar'
import { CheckCircle2, Clock3, Dumbbell, SkipForward } from 'lucide-react'

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
  BEGINNER:     'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20',
  INTERMEDIATE: 'bg-amber-500/15  text-amber-400  ring-amber-500/20',
  ADVANCED:     'bg-red-500/15    text-red-400    ring-red-500/20',
} as const

// ─── Status indicator ─────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status?: WorkoutStatus | null }) {
  if (!status || status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <Clock3 size={12} />
        Pending
      </span>
    )
  }
  if (status === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        In Progress
      </span>
    )
  }
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle2 size={12} />
        Completed
      </span>
    )
  }
  if (status === 'SKIPPED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <SkipForward size={12} />
        Skipped
      </span>
    )
  }
  return null
}

// ─── Day chip ─────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkoutPlanCardProps {
  plan: WorkoutPlan & {
    assignedMemberName?: string | null
    assignedMemberAvatar?: string | null
    todayStatus?: WorkoutStatus | null
    exerciseCount?: number
  }
  currentUserId?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkoutPlanCard({ plan, currentUserId }: WorkoutPlanCardProps) {
  const isAssignedToMe = plan.assignedTo === currentUserId
  const exerciseCount = plan.exerciseCount ?? plan.exercises?.length ?? 0

  return (
    <Link href={`/workout-plans/${plan.id}`} className="block group">
      <div
        className={cn(
          'relative rounded-2xl border bg-surface p-5 transition-all duration-200',
          'hover:border-white/15 hover:bg-surface-3',
          isAssignedToMe
            ? 'border-primary/25 ring-1 ring-primary/10'
            : 'border-border',
        )}
      >
        {/* Assigned-to-me indicator */}
        {isAssignedToMe && (
          <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary ring-2 ring-primary/25" />
        )}

        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="shrink-0 h-10 w-10 rounded-xl bg-surface-2 flex items-center justify-center border border-white/5">
            <Dumbbell size={18} className="text-primary" strokeWidth={1.75} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-foreground transition-colors">
              {plan.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <CategoryBadge category={plan.category} />
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                  DIFFICULTY_STYLES[plan.difficulty],
                )}
              >
                {plan.difficulty.charAt(0) + plan.difficulty.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {plan.description && (
          <p className="text-xs text-muted mb-3 line-clamp-2">{plan.description}</p>
        )}

        {/* Scheduled days */}
        {parseScheduledDays(plan.scheduledDays as unknown as string).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {parseScheduledDays(plan.scheduledDays as unknown as string).map((day) => (
              <span
                key={day}
                className="bg-primary/15 text-primary text-xs px-2 py-0.5 rounded-md font-medium"
              >
                {DAY_LABELS[day] ?? day}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/6">
          <div className="flex items-center gap-2">
            {plan.assignedMemberName ? (
              <>
                <Avatar
                  src={plan.assignedMemberAvatar}
                  name={plan.assignedMemberName}
                  size="sm"
                />
                <span className="text-xs text-muted truncate max-w-[100px]">
                  {plan.assignedMemberName}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted">Unassigned</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </span>
            <StatusIndicator status={plan.todayStatus} />
          </div>
        </div>
      </div>
    </Link>
  )
}
