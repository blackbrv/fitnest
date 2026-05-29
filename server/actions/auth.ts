'use server'

import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'
import { ActionResult } from '@/types'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function registerUser(formData: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    }
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists',
    }
  }

  const hashedPassword = await hash(password, 12)

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  await createSession({ userId: user.id, email: user.email, name: user.name })

  redirect('/dashboard')
}

export async function loginUser(formData: {
  email: string
  password: string
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    }
  }

  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password',
    }
  }

  const passwordMatch = await compare(password, user.password)
  if (!passwordMatch) {
    return {
      success: false,
      error: 'Invalid email or password',
    }
  }

  await createSession({ userId: user.id, email: user.email, name: user.name })

  redirect('/dashboard')
}

export async function logoutUser(): Promise<void> {
  await deleteSession()
  redirect('/login')
}

export async function requestPasswordReset(formData: {
  email: string
}): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    }
  }

  const { email } = parsed.data

  // Check if user exists (don't reveal whether email is registered for security)
  await db.user.findUnique({ where: { email } })

  // Always return success to prevent email enumeration
  return {
    success: true,
  }
}
