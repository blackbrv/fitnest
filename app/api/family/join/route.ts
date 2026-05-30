import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

const schema = z.object({
  inviteCode: z.string().length(8),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const inviteCode = parsed.data.inviteCode.toUpperCase()

    const family = await db.family.findUnique({ where: { inviteCode } })
    if (!family) {
      return err('Family not found', 404)
    }

    const existingMembership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })
    if (existingMembership) {
      return err('You are already in a family', 409)
    }

    const memberCount = await db.familyMember.count({
      where: { familyId: family.id },
    })
    if (memberCount >= 10) {
      return err('Family is full', 403)
    }

    await db.familyMember.create({
      data: {
        familyId: family.id,
        userId: session.userId,
        role: 'MEMBER',
      },
    })

    return Response.json(
      {
        data: {
          family: {
            id: family.id,
            familyName: family.familyName,
            inviteCode: family.inviteCode,
            role: 'MEMBER',
          },
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[POST /api/family/join]', error)
    return err('Internal server error', 500)
  }
}
