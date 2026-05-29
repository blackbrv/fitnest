'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Flame, Activity, Users } from 'lucide-react'
import { cn, getInitials, formatDate } from '@/lib/utils'

interface ProfileHeaderProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
    createdAt: Date
  }
  stats: {
    workoutsCompleted: number
    currentStreak: number
  }
  familyName: string | null
}

export function ProfileHeader({
  user,
  stats,
  familyName,
}: ProfileHeaderProps) {
  const [avatarError, setAvatarError] = useState(false)
  const initials = getInitials(user.name)

  const quickStats = [
    {
      label: 'Workouts',
      value: stats.workoutsCompleted,
      icon: Activity,
      color: 'text-[#a3ff3f]',
    },
    {
      label: 'Streak',
      value: `${stats.currentStreak}d`,
      icon: Flame,
      color: 'text-orange-400',
    },
    {
      label: 'Family',
      value: familyName ?? '—',
      icon: Users,
      color: 'text-blue-400',
      truncate: true,
    },
  ]

  return (
    <div className="rounded-2xl border border-white/8 bg-[#151922] overflow-hidden">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-[#a3ff3f]/20 via-[#6366f1]/20 to-[#a3ff3f]/10" />

      <div className="px-5 pb-5">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="relative">
            <span
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-2xl ring-4 ring-[#151922]',
                'text-xl font-bold overflow-hidden',
                user.avatar && !avatarError
                  ? ''
                  : 'bg-[#1c2433] text-[#a3ff3f]',
              )}
            >
              {user.avatar && !avatarError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                initials
              )}
            </span>
          </div>

          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2 rounded-xl border border-white/8',
              'bg-[#1c2433] px-3 py-2 text-sm font-medium text-[#f5f7fa]',
              'hover:bg-[#242e40] hover:border-white/14 transition-colors duration-150',
            )}
          >
            <Edit2 size={14} className="text-[#8b95a5]" />
            Edit Profile
          </Link>
        </div>

        {/* User info */}
        <div className="space-y-0.5 mb-4">
          <h2 className="text-xl font-bold text-[#f5f7fa]">{user.name}</h2>
          <p className="text-sm text-[#8b95a5]">{user.email}</p>
          <p className="text-xs text-[#8b95a5]/70">
            Member since {formatDate(user.createdAt)}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-[#1c2433]/50 p-3 text-center"
              >
                <Icon size={16} className={stat.color} />
                <p
                  className={cn(
                    'text-sm font-bold text-[#f5f7fa]',
                    stat.truncate && 'truncate max-w-full',
                  )}
                  title={String(stat.value)}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-[#8b95a5]">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
