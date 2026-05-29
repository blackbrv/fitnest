import { WorkoutCategory } from '@/types'
import { cn } from '@/lib/utils'

// ─── Color mapping ────────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<
  WorkoutCategory,
  { bg: string; text: string; ring: string; dot: string }
> = {
  STRENGTH:     { bg: 'bg-[#a3ff3f]/12', text: 'text-[#a3ff3f]',   ring: 'ring-[#a3ff3f]/20',   dot: 'bg-[#a3ff3f]' },
  CARDIO:       { bg: 'bg-orange-500/12', text: 'text-orange-400',   ring: 'ring-orange-500/20',  dot: 'bg-orange-400' },
  STRETCHING:   { bg: 'bg-sky-500/12',    text: 'text-sky-400',      ring: 'ring-sky-500/20',     dot: 'bg-sky-400' },
  MOBILITY:     { bg: 'bg-purple-500/12', text: 'text-purple-400',   ring: 'ring-purple-500/20',  dot: 'bg-purple-400' },
  KIDS_EXERCISE:{ bg: 'bg-pink-500/12',   text: 'text-pink-400',     ring: 'ring-pink-500/20',    dot: 'bg-pink-400' },
  RECOVERY:     { bg: 'bg-emerald-500/12',text: 'text-emerald-400',  ring: 'ring-emerald-500/20', dot: 'bg-emerald-400' },
}

const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  STRENGTH:      'Strength',
  CARDIO:        'Cardio',
  STRETCHING:    'Stretching',
  MOBILITY:      'Mobility',
  KIDS_EXERCISE: 'Kids',
  RECOVERY:      'Recovery',
}

// ─── Utility export ───────────────────────────────────────────────────────────

export function getCategoryColor(category: WorkoutCategory) {
  return CATEGORY_COLORS[category]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CategoryBadgeProps {
  category: WorkoutCategory
  showDot?: boolean
  className?: string
}

export function CategoryBadge({ category, showDot = false, className }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium ring-1 ring-inset',
        colors.bg,
        colors.text,
        colors.ring,
        className,
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)} aria-hidden="true" />
      )}
      {CATEGORY_LABELS[category]}
    </span>
  )
}
