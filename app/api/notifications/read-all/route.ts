import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    await db.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    })

    return Response.json(
      { data: { message: 'All notifications marked as read' } },
      { status: 200 },
    )
  } catch (error) {
    console.error('[POST /api/notifications/read-all]', error)
    return err('Internal server error', 500)
  }
}
