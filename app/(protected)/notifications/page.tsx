import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ROUTES } from '@/constants'
import { NotificationItem } from '@/components/shared/NotificationItem'
import { MarkAllReadButton } from '@/components/shared/MarkAllReadButton'
import { Bell } from 'lucide-react'
import type { Notification } from '@/types'

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'mock',
    type: 'WORKOUT_REMINDER',
    title: 'Time to workout!',
    message: 'You have a Leg Day scheduled today',
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    userId: 'mock',
    type: 'FAMILY_ACTIVITY',
    title: 'Sarah completed her workout',
    message: 'Sarah just finished Upper Body Strength',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    userId: 'mock',
    type: 'STREAK_REMINDER',
    title: 'Keep your streak alive!',
    message: "You're on a 7-day streak. Don't break it!",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000),
  },
]

export default async function NotificationsPage() {
  const session = await getSession()
  if (!session) redirect(ROUTES.LOGIN)

  let notifications: Notification[] = mockNotifications

  try {
    const dbNotifications = await db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    if (dbNotifications.length > 0) {
      notifications = dbNotifications as Notification[]
    }
  } catch {
    // Use mock data
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="p-5 lg:p-7 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8 mb-4">
            <Bell size={24} className="text-muted" />
          </div>
          <p className="text-base font-semibold text-foreground">No notifications yet</p>
          <p className="mt-1 text-sm text-muted">
            We'll let you know when something happens
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div key={notification.id} className="px-2 py-1 first:pt-2 last:pb-2">
                <NotificationItem notification={notification} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
