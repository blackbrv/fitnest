import { NextRequest } from 'next/server'
import { z } from 'zod'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import { createToken } from '@/lib/auth'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { email, password } = parsed.data

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return err('Invalid email or password', 401)
    }

    const valid = await compare(password, user.password)
    if (!valid) {
      return err('Invalid email or password', 401)
    }

    if (!user.emailVerified) {
      return Response.json({ error: 'EMAIL_NOT_VERIFIED', email: user.email }, { status: 403 })
    }

    const token = await createToken({ userId: user.id, email: user.email, name: user.name })

    return Response.json(
      {
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            emailVerified: user.emailVerified,
          },
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return err('Internal server error', 500)
  }
}
