import { Activity, Calendar, Flame, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ComponentType } from 'react'
import { LucideProps } from 'lucide-react'

interface StatItem {
  label: string
  value: string | number
  icon: ComponentType<LucideProps>
  iconColor: string
  iconBg: string
  trend?: number
  trendUp?: boolean
  suffix?: string
}

interface StatsOverviewProps {
  workoutsCompleted: number
  totalActiveDays: number
  currentStreak: number
  consistencyRate: number
}

export function StatsOverview({
  workoutsCompleted,
  totalActiveDays,
  currentStreak,
  consistencyRate,
}: StatsOverviewProps) {
  const stats: StatItem[] = [
    {
      label: 'Workouts Completed',
      value: workoutsCompleted,
      icon: Activity,
      iconColor: 'text-primary',
      iconBg: 'bg-[#a3ff3f]/10',
      trend: 12,
      trendUp: true,
    },
    {
      label: 'Total Active Days',
      value: totalActiveDays,
      icon: Calendar,
      iconColor: 'text-primary',
      iconBg: 'bg-[#a3ff3f]/10',
      trend: 8,
      trendUp: true,
    },
    {
      label: 'Current Streak',
      value: currentStreak,
      icon: Flame,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-400/10',
      suffix: currentStreak === 1 ? 'day' : 'days',
    },
    {
      label: 'Consistency Rate',
      value: `${consistencyRate}%`,
      icon: Target,
      iconColor: 'text-primary',
      iconBg: 'bg-[#a3ff3f]/10',
      trend: 5,
      trendUp: consistencyRate >= 70,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 lg:p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted lg:text-sm">
                {stat.label}
              </span>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl lg:h-9 lg:w-9',
                  stat.iconBg,
                )}
              >
                <Icon size={16} className={cn('lg:size-[18px]', stat.iconColor)} strokeWidth={2} />
              </span>
            </div>

            <div className="flex items-end justify-between gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-xs text-muted mb-0.5">{stat.suffix}</span>
                )}
              </div>

              {stat.trend !== undefined && (
                <div
                  className={cn(
                    'mb-0.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
                    stat.trendUp
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400',
                  )}
                >
                  <span>{stat.trendUp ? '+' : '-'}{stat.trend}%</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
