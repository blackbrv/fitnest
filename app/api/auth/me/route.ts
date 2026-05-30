import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    if (!user) {
      return err('User not found', 404)
    }

    const memberRecord = await db.familyMember.findFirst({
      where: { userId: session.userId },
      include: {
        family: {
          select: { id: true, familyName: true, inviteCode: true },
        },
      },
    })

    const family = memberRecord
      ? {
          id: memberRecord.family.id,
          familyName: memberRecord.family.familyName,
          inviteCode: memberRecord.family.inviteCode,
        }
      : null

    return Response.json(
      { data: { user: { ...user, family } } },
      { status: 200 },
    )
  } catch (error) {
    console.error('[GET /api/auth/me]', error)
    return err('Internal server error', 500)
  }
}
