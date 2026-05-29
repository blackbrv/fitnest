import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const skip = (page - 1) * limit

  try {
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({
        where: { userId: session.userId },
      }),
    ])

    return Response.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { notificationId } = body

    if (!notificationId || typeof notificationId !== 'string') {
      return Response.json({ error: 'notificationId is required' }, { status: 400 })
    }

    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return Response.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.userId !== session.userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return Response.json({ notification: updated })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
