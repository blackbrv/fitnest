'use client'

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
    icon: <Clock size={13} className="text-[#8b95a5]" />,
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
    <div
      className={cn(
        'rounded-2xl border bg-[#151922] p-4',
        'transition-all duration-200',
        isCompleted ? 'border-[#a3ff3f]/20' : 'border-white/8',
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
                ? 'bg-[#a3ff3f]/15 text-[#a3ff3f] ring-[#a3ff3f]/30'
                : 'bg-[#1c2433] text-[#8b95a5] ring-white/10',
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
          <p className="text-sm font-semibold text-[#f5f7fa] truncate">
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
          <span className="text-xs font-semibold text-[#f5f7fa]">
            {streak} day streak
          </span>
        </div>
        <span className="text-xs text-[#8b95a5]">
          {completionRate}% this week
        </span>
      </div>

      {/* Completion progress */}
      <Progress value={completionRate} size="sm" className="mb-3" />

      {/* Assigned workout */}
      {workoutName && (
        <div className="rounded-xl bg-[#1c2433] px-3 py-2">
          <p className="text-[10px] text-[#8b95a5] mb-0.5">Assigned workout</p>
          <p className="text-xs font-medium text-[#f5f7fa] truncate">
            {workoutName}
          </p>
        </div>
      )}

      {!workoutName && (
        <div className="rounded-xl bg-[#1c2433]/60 border border-dashed border-white/10 px-3 py-2">
          <p className="text-xs text-[#8b95a5] text-center">No workout assigned</p>
        </div>
      )}
    </div>
  )
}
