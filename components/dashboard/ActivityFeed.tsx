'use client'

import Link from 'next/link'
import { cn, getInitials } from '@/lib/utils'
import { CheckCircle2, Flame, Trophy, UserPlus, Dumbbell } from 'lucide-react'

export interface ActivityItem {
  id: string
  memberName: string
  action: string
  detail: string
  timeAgo: string
  type: 'workout' | 'streak' | 'achievement' | 'joined' | 'plan'
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', memberName: 'Sarah Johnson',  action: 'completed', detail: 'Full Body Strength',         timeAgo: '18m ago', type: 'workout' },
  { id: '2', memberName: 'Marcus Johnson', action: 'hit a',     detail: '7-day streak',               timeAgo: '1h ago',  type: 'streak' },
  { id: '3', memberName: 'Emma Johnson',   action: 'finished',  detail: 'Yoga & Mobility',            timeAgo: '2h ago',  type: 'workout' },
  { id: '4', memberName: 'Sarah Johnson',  action: 'unlocked',  detail: 'Consistency Champion badge', timeAgo: '3h ago',  type: 'achievement' },
  { id: '5', memberName: 'Liam Johnson',   action: 'completed', detail: 'Kids Cardio Fun',            timeAgo: '5h ago',  type: 'workout' },
  { id: '6', memberName: 'Marcus Johnson', action: 'finished',  detail: '3 workouts this week',       timeAgo: '1d ago',  type: 'plan' },
  { id: '7', memberName: 'Emma Johnson',   action: 'joined',    detail: 'the family plan',            timeAgo: '2d ago',  type: 'joined' },
]

const TYPE_CONFIG = {
  workout:     { icon: CheckCircle2, iconColor: 'text-emerald-400', dotBg: 'bg-emerald-400/20', avatarRing: 'ring-emerald-400/20' },
  streak:      { icon: Flame,        iconColor: 'text-orange-400',  dotBg: 'bg-orange-400/20',  avatarRing: 'ring-orange-400/20' },
  achievement: { icon: Trophy,       iconColor: 'text-amber-400',   dotBg: 'bg-amber-400/20',   avatarRing: 'ring-amber-400/20' },
  joined:      { icon: UserPlus,     iconColor: 'text-primary',     dotBg: 'bg-primary/20',     avatarRing: 'ring-primary/20' },
  plan:        { icon: Dumbbell,     iconColor: 'text-muted',       dotBg: 'bg-white/8',        avatarRing: 'ring-white/10' },
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
}

export function ActivityFeed({ activities = MOCK_ACTIVITIES }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        <span className="text-[10px] font-medium text-muted bg-white/5 px-2 py-0.5 rounded-full tracking-wide uppercase">
          Today
        </span>
      </div>

      {/* Feed */}
      <div className="overflow-y-auto max-h-[340px] px-3 py-2">
        {activities.map((item, index) => {
          const { icon: Icon, iconColor, dotBg, avatarRing } = TYPE_CONFIG[item.type]
          const isLast = index === activities.length - 1

          return (
            <div key={item.id} className="flex items-start gap-3 relative py-2">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-[15px] top-[32px] bottom-0 w-px bg-white/5" />
              )}

              {/* Avatar + type dot */}
              <div className="relative flex-shrink-0">
                <span
                  className={cn(
                    'flex w-8 h-8 rounded-full items-center justify-center',
                    'bg-surface-2 text-[10px] font-bold text-foreground',
                    'ring-1',
                    avatarRing,
                  )}
                >
                  {getInitials(item.memberName)}
                </span>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full',
                    'flex items-center justify-center',
                    'ring-[1.5px] ring-surface',
                    dotBg,
                  )}
                >
                  <Icon size={8} className={iconColor} />
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs text-foreground leading-snug">
                  <span className="font-semibold">{item.memberName.split(' ')[0]}</span>
                  {' '}
                  <span className="text-muted">{item.action}</span>
                  {' '}
                  <span className="font-medium text-foreground/70">{item.detail}</span>
                </p>
                <p className="text-[10px] text-muted/70 mt-0.5">{item.timeAgo}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border">
        <Link
          href="/activity"
          className="block w-full text-[11px] font-medium text-muted hover:text-primary transition-colors text-center"
        >
          View all activity
        </Link>
      </div>
    </div>
  )
}
