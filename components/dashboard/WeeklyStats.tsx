'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Flame, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const ease = [0.21, 0.47, 0.32, 0.98] as const

interface StatCard {
  icon: React.ReactNode
  value: string | number
  label: string
  trend?: string
}

interface WeeklyStatsProps {
  totalWorkouts: number
  activeStreak: number
  completionRate: number
  familyMembers: number
}

export function WeeklyStats({
  totalWorkouts,
  activeStreak,
  completionRate,
  familyMembers,
}: WeeklyStatsProps) {
  const stats: StatCard[] = [
    {
      icon: <Dumbbell size={20} className="text-primary" />,
      value: totalWorkouts,
      label: 'Total Workouts',
      trend: 'This week',
    },
    {
      icon: <Flame size={20} className="text-primary" />,
      value: `${activeStreak}d`,
      label: 'Active Streak',
      trend: 'Current',
    },
    {
      icon: <TrendingUp size={20} className="text-primary" />,
      value: `${completionRate}%`,
      label: 'Completion Rate',
      trend: 'This week',
    },
    {
      icon: <Users size={20} className="text-primary" />,
      value: familyMembers,
      label: 'Family Members',
      trend: 'Active',
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.97 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.45, ease },
            },
          }}
          className={cn(
            'rounded-2xl border border-border bg-surface',
            'p-4 flex flex-col gap-3',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              {stat.icon}
            </div>
            {stat.trend && (
              <span className="text-[10px] text-muted font-medium">
                {stat.trend}
              </span>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground leading-none mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-muted font-medium">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
