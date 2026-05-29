'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types'

export async function markNotificationRead(
  notificationId: string,
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return { success: false, error: 'Notification not found' }
    }

    if (notification.userId !== session.userId) {
      return { success: false, error: 'Forbidden' }
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    revalidatePath('/notifications')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await db.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    })

    revalidatePath('/notifications')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to mark all notifications as read' }
  }
}
