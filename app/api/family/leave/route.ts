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

    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })

    if (!membership) {
      return err('You are not in a family', 404)
    }

    if (membership.role === 'OWNER') {
      return err(
        'Owner cannot leave. Transfer ownership first or delete the family.',
        403,
      )
    }

    await db.familyMember.delete({ where: { id: membership.id } })

    return Response.json({ data: { message: 'Left family successfully' } }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/family/leave]', error)
    return err('Internal server error', 500)
  }
}
