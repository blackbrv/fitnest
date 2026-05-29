import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest) {
  const session = await getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find the user's family membership
    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
      include: { family: true },
    })

    if (!membership) {
      return Response.json({ error: 'You are not a member of any family.' }, { status: 404 })
    }

    // Fetch all members of that family, including their user data
    const members = await db.familyMember.findMany({
      where: { familyId: membership.familyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    return Response.json({
      familyId: membership.familyId,
      familyName: membership.family.familyName,
      members: members.map((m: typeof members[number]) => ({
        id: m.id,
        familyId: m.familyId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    })
  } catch (error) {
    console.error('[GET /api/family-members]', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
