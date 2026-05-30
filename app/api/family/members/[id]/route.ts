import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const { id } = await params

    const callerMembership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })

    if (!callerMembership || callerMembership.role !== 'OWNER') {
      return err('Forbidden', 403)
    }

    const targetMembership = await db.familyMember.findFirst({
      where: { id, familyId: callerMembership.familyId },
    })

    if (!targetMembership) {
      return err('Member not found', 404)
    }

    if (targetMembership.userId === session.userId) {
      return err('Cannot remove yourself', 400)
    }

    await db.familyMember.delete({ where: { id: targetMembership.id } })

    return Response.json({ data: { message: 'Member removed' } }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/family/members/[id]]', error)
    return err('Internal server error', 500)
  }
}
