import { NextRequest } from 'next/server'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'

export const OPTIONS = () => new Response(null, { status: 204 })

function err(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
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

    const { name, email, password } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return err('An account with this email already exists', 409)
    }

    const hashedPassword = await hash(password, 12)
    const verificationToken = randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verificationExpiry,
        emailVerified: false,
      },
    })

    await sendVerificationEmail(email, verificationToken)

    return Response.json(
      { data: { message: 'Account created. Please check your email to verify your account.' } },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/auth/register]', error)
    return err('Internal server error', 500)
  }
}
