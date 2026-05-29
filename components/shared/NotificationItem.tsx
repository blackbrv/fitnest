'use client'

import { useState, useTransition } from 'react'
import { Dumbbell, Flame, Users, AlertCircle, Bell } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { markNotificationRead } from '@/server/actions/notifications'
import type { NotificationType } from '@/types'

interface NotificationItemProps {
  notification: {
    id: string
    type: NotificationType
    title: string
    message: string
    isRead: boolean
    createdAt: Date
  }
}

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; iconColor: string; iconBg: string }
> = {
  WORKOUT_REMINDER: {
    icon: Dumbbell,
    iconColor: 'text-[#a3ff3f]',
    iconBg: 'bg-[#a3ff3f]/10',
  },
  STREAK_REMINDER: {
    icon: Flame,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-400/10',
  },
  FAMILY_ACTIVITY: {
    icon: Users,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/10',
  },
  MISSED_WORKOUT: {
    icon: AlertCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10',
  },
  GENERAL: {
    icon: Bell,
    iconColor: 'text-[#8b95a5]',
    iconBg: 'bg-white/8',
  },
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.isRead)
  const [isPending, startTransition] = useTransition()
  const config = typeConfig[notification.type] ?? typeConfig.GENERAL
  const Icon = config.icon

  function handleMarkRead() {
    if (isRead) return
    setIsRead(true)
    startTransition(async () => {
      await markNotificationRead(notification.id)
    })
  }

  return (
    <button
      type="button"
      onClick={handleMarkRead}
      disabled={isPending}
      className={cn(
        'w-full flex items-start gap-3 rounded-xl border p-4 text-left',
        'transition-colors duration-150',
        isRead
          ? 'border-white/5 bg-transparent hover:bg-white/3'
          : 'border-white/10 bg-[#1c2433]/60 hover:bg-[#1c2433]',
        isPending && 'opacity-60 pointer-events-none',
      )}
    >
      {/* Icon */}
      <span
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          config.iconBg,
        )}
      >
        <Icon size={17} className={config.iconColor} strokeWidth={2} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-semibold leading-tight',
              isRead ? 'text-[#8b95a5]' : 'text-[#f5f7fa]',
            )}
          >
            {notification.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-[#8b95a5]">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {!isRead && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#a3ff3f]" />
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-[#8b95a5] leading-relaxed line-clamp-2">
          {notification.message}
        </p>
      </div>
    </button>
  )
}
