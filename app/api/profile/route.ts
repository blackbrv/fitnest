import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession, createToken } from '@/lib/auth'
import { db } from '@/lib/db'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(300).optional().nullable(),
  avatar: z
    .string()
    .max(2097152)
    .refine((v) => v.startsWith('data:image/'), {
      message: 'avatar must be a base64 data:image/ string',
    })
    .optional()
    .nullable(),
})

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

    return Response.json({ data: { user } }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/profile]', error)
    return err('Internal server error', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, bio, avatar } = parsed.data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    const updated = await db.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, name: true, email: true, avatar: true, bio: true },
    })

    const nameChanged = name !== undefined && name !== session.name
    let token: string | undefined
    if (nameChanged) {
      token = await createToken({ userId: updated.id, email: updated.email, name: updated.name })
    }

    return Response.json(
      { data: { user: updated, ...(token ? { token } : {}) } },
      { status: 200 },
    )
  } catch (error) {
    console.error('[PATCH /api/profile]', error)
    return err('Internal server error', 500)
  }
}
