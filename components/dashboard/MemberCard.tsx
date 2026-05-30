'use client'

import { motion } from 'framer-motion'
import { Flame, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import type { WorkoutStatus, UserRole } from '@/types'

interface MemberCardProps {
  name: string
  role: UserRole
  todayStatus: WorkoutStatus | null
  streak: number
  completionRate: number
  workoutName?: string | null
}

const statusConfig: Record<
  WorkoutStatus,
  { label: string; icon: React.ReactNode; badgeVariant: 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  COMPLETED: {
    label: 'Completed',
    icon: <CheckCircle2 size={13} className="text-emerald-400" />,
    badgeVariant: 'success',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: <Clock size={13} className="text-amber-400" />,
    badgeVariant: 'warning',
  },
  PENDING: {
    label: 'Pending',
    icon: <Clock size={13} className="text-muted" />,
    badgeVariant: 'neutral',
  },
  SKIPPED: {
    label: 'Skipped',
    icon: <XCircle size={13} className="text-red-400" />,
    badgeVariant: 'danger',
  },
}

export function MemberCard({
  name,
  role,
  todayStatus,
  streak,
  completionRate,
  workoutName,
}: MemberCardProps) {
  const initials = getInitials(name)
  const status = todayStatus ? statusConfig[todayStatus] : null
  const isCompleted = todayStatus === 'COMPLETED'

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        'rounded-2xl border bg-surface p-4',
        'transition-colors duration-200',
        isCompleted ? 'border-primary/20' : 'border-border',
      )}
    >
      {/* Top row: avatar + name + role + status */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <span
            className={cn(
              'flex w-11 h-11 rounded-full items-center justify-center',
              'text-sm font-semibold',
              'ring-2',
              isCompleted
                ? 'bg-primary/15 text-primary ring-primary/30'
                : 'bg-surface-2 text-muted ring-white/10',
            )}
            aria-label={name}
          >
            {initials}
          </span>
          {isCompleted && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={10} className="text-white" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <Badge variant={role === 'OWNER' ? 'primary' : 'neutral'}>
              {role === 'OWNER' ? 'Owner' : 'Member'}
            </Badge>
            {status && (
              <Badge variant={status.badgeVariant}>
                <span className="flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Flame size={14} className="text-orange-400" />
          <span className="text-xs font-semibold text-foreground">
            {streak} day streak
          </span>
        </div>
        <span className="text-xs text-muted">
          {completionRate}% this week
        </span>
      </div>

      {/* Completion progress */}
      <Progress value={completionRate} size="sm" className="mb-3" />

      {/* Assigned workout */}
      {workoutName && (
        <div className="rounded-xl bg-surface-2 px-3 py-2">
          <p className="text-[10px] text-muted mb-0.5">Assigned workout</p>
          <p className="text-xs font-medium text-foreground truncate">
            {workoutName}
          </p>
        </div>
      )}

      {!workoutName && (
        <div className="rounded-xl bg-surface-2/60 border border-dashed border-white/10 px-3 py-2">
          <p className="text-xs text-muted text-center">No workout assigned</p>
        </div>
      )}
    </motion.div>
  )
}
