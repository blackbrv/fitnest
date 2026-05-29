import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { CheckCircle2, Flame, Trophy, UserPlus, Dumbbell } from 'lucide-react'

interface ActivityItem {
  id: string
  memberName: string
  action: string
  detail: string
  timeAgo: string
  type: 'workout' | 'streak' | 'achievement' | 'joined' | 'plan'
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    memberName: 'Sarah Johnson',
    action: 'completed',
    detail: 'Full Body Strength',
    timeAgo: '18m ago',
    type: 'workout',
  },
  {
    id: '2',
    memberName: 'Marcus Johnson',
    action: 'hit a',
    detail: '7-day streak',
    timeAgo: '1h ago',
    type: 'streak',
  },
  {
    id: '3',
    memberName: 'Emma Johnson',
    action: 'finished',
    detail: 'Yoga & Mobility',
    timeAgo: '2h ago',
    type: 'workout',
  },
  {
    id: '4',
    memberName: 'Sarah Johnson',
    action: 'unlocked',
    detail: 'Consistency Champion badge',
    timeAgo: '3h ago',
    type: 'achievement',
  },
  {
    id: '5',
    memberName: 'Liam Johnson',
    action: 'completed',
    detail: 'Kids Cardio Fun',
    timeAgo: '5h ago',
    type: 'workout',
  },
  {
    id: '6',
    memberName: 'Marcus Johnson',
    action: 'finished',
    detail: '3 workouts this week',
    timeAgo: '1d ago',
    type: 'plan',
  },
  {
    id: '7',
    memberName: 'Emma Johnson',
    action: 'joined',
    detail: 'the family plan',
    timeAgo: '2d ago',
    type: 'joined',
  },
]

const TYPE_ICON = {
  workout: <CheckCircle2 size={12} className="text-emerald-400" />,
  streak: <Flame size={12} className="text-orange-400" />,
  achievement: <Trophy size={12} className="text-amber-400" />,
  joined: <UserPlus size={12} className="text-[#a3ff3f]" />,
  plan: <Dumbbell size={12} className="text-[#8b95a5]" />,
}

const TYPE_DOT_COLOR = {
  workout: 'bg-emerald-400',
  streak: 'bg-orange-400',
  achievement: 'bg-amber-400',
  joined: 'bg-[#a3ff3f]',
  plan: 'bg-[#8b95a5]',
}

interface ActivityFeedProps {
  activities?: ActivityItem[]
}

export function ActivityFeed({ activities = MOCK_ACTIVITIES }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#151922] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
        <h2 className="text-base font-semibold text-[#f5f7fa]">
          Recent Activity
        </h2>
        <span className="text-xs text-[#8b95a5] bg-white/5 px-2 py-0.5 rounded-full">
          Today
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-0 max-h-[380px]">
        {activities.map((item, index) => {
          const initials = getInitials(item.memberName)
          const dotColor = TYPE_DOT_COLOR[item.type]
          const icon = TYPE_ICON[item.type]
          const isLast = index === activities.length - 1

          return (
            <div key={item.id} className="flex gap-3 py-3 relative">
              {/* Vertical connector line */}
              {!isLast && (
                <div className="absolute left-[18px] top-[44px] bottom-0 w-px bg-white/6" />
              )}

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <span
                  className={cn(
                    'flex w-9 h-9 rounded-full items-center justify-center',
                    'bg-[#1c2433] text-[#a3ff3f] text-xs font-semibold',
                    'ring-1 ring-white/10',
                  )}
                  aria-label={item.memberName}
                >
                  {initials}
                </span>
                {/* Type indicator dot */}
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full',
                    'flex items-center justify-center',
                    'bg-[#151922] ring-1 ring-[#151922]',
                  )}
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full flex items-center justify-center', dotColor)}>
                    {icon}
                  </span>
                </span>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-[#f5f7fa] leading-snug">
                  <span className="font-semibold">{item.memberName}</span>{' '}
                  <span className="text-[#8b95a5]">{item.action}</span>{' '}
                  <span className="font-medium">{item.detail}</span>
                </p>
                <p className="text-xs text-[#8b95a5] mt-0.5">{item.timeAgo}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
