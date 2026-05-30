import { NextRequest } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

const createFamilySchema = z.object({
  familyName: z.string().min(2).max(50),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const membership = await db.familyMember.findFirst({
      where: { userId: session.userId },
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
          },
        },
      },
    })

    if (!membership) {
      return err('Not in a family', 404)
    }

    const { family } = membership

    return Response.json(
      {
        data: {
          family: {
            id: family.id,
            familyName: family.familyName,
            inviteCode: family.inviteCode,
            role: membership.role,
          },
          members: family.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role,
            joinedAt: m.joinedAt,
          })),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[GET /api/family]', error)
    return err('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const body = await request.json()
    const parsed = createFamilySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const existing = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })
    if (existing) {
      return err('You are already in a family', 409)
    }

    const inviteCode = randomBytes(4).toString('hex').toUpperCase().slice(0, 8)

    const family = await db.$transaction(async (tx) => {
      const created = await tx.family.create({
        data: {
          familyName: parsed.data.familyName,
          inviteCode,
          ownerId: session.userId,
        },
      })

      await tx.familyMember.create({
        data: {
          familyId: created.id,
          userId: session.userId,
          role: 'OWNER',
        },
      })

      return created
    })

    return Response.json(
      {
        data: {
          family: {
            id: family.id,
            familyName: family.familyName,
            inviteCode: family.inviteCode,
            role: 'OWNER',
          },
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/family]', error)
    return err('Internal server error', 500)
  }
}
