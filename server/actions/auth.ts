'use server'

import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hash, compare } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { ActionResult } from '@/types'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'

// ── Schemas ───────────────────────────────────────────────────────────────

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

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ── Helpers ───────────────────────────────────────────────────────────────

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// ── Actions ───────────────────────────────────────────────────────────────

export async function registerUser(formData: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { name, email, password } = parsed.data

  try {
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return { success: false, error: 'An account with this email already exists' }
    }

    const hashedPassword = await hash(password, 12)
    const token = generateToken()
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: token,
        verificationExpiry: expiry,
      },
    })

    await sendVerificationEmail(email, token)
  } catch (err) {
    console.error('Register error:', err)
    return {
      success: false,
      error: 'Unable to create account. Make sure the database is running and migrations have been applied.',
    }
  }

  redirect('/verify-email/pending')
}

export async function loginUser(formData: {
  email: string
  password: string
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, password } = parsed.data

  try {
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (!user.emailVerified) {
      return { success: false, error: `UNVERIFIED:${email}` }
    }

    await createSession({ userId: user.id, email: user.email, name: user.name })
  } catch (err) {
    console.error('Login error:', err)
    return {
      success: false,
      error: 'Unable to connect to the database. Make sure DATABASE_URL is set and migrations have been run.',
    }
  }

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
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data

  try {
    const user = await db.user.findUnique({ where: { email } })
    if (user) {
      const token = generateToken()
      const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetExpiry: expiry },
      })

      await sendPasswordResetEmail(email, token)
    }
  } catch (err) {
    console.error('Password reset request error:', err)
  }

  // Always return success to prevent email enumeration
  return { success: true }
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  if (!token) return { success: false, error: 'Invalid verification link' }

  try {
    const user = await db.user.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      return { success: false, error: 'Invalid or already used verification link' }
    }

    if (user.emailVerified) {
      return { success: true }
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return { success: false, error: 'EXPIRED' }
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    })

    return { success: true }
  } catch (err) {
    console.error('Email verification error:', err)
    return { success: false, error: 'Verification failed. Please try again.' }
  }
}

export async function resendVerificationEmail(email: string): Promise<ActionResult> {
  if (!email) return { success: false, error: 'Email is required' }

  try {
    const user = await db.user.findUnique({ where: { email } })

    if (!user || user.emailVerified) {
      // Don't reveal whether email exists
      return { success: true }
    }

    // Rate limit: don't resend if last token was issued < 2 minutes ago
    if (user.verificationExpiry) {
      const tokenAge = 24 * 60 * 60 * 1000 - (user.verificationExpiry.getTime() - Date.now())
      if (tokenAge < 2 * 60 * 1000) {
        return { success: false, error: 'Please wait a moment before requesting another email' }
      }
    }

    const token = generateToken()
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationExpiry: expiry },
    })

    await sendVerificationEmail(email, token)
    return { success: true }
  } catch (err) {
    console.error('Resend verification error:', err)
    return { success: false, error: 'Failed to resend email. Please try again.' }
  }
}

export async function resetPassword(formData: {
  token: string
  password: string
  confirmPassword: string
}): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { token, password } = parsed.data

  try {
    const user = await db.user.findFirst({
      where: { resetToken: token },
    })

    if (!user) {
      return { success: false, error: 'Invalid or expired reset link' }
    }

    if (user.resetExpiry && user.resetExpiry < new Date()) {
      return { success: false, error: 'EXPIRED' }
    }

    const hashedPassword = await hash(password, 12)

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null,
      },
    })

    return { success: true }
  } catch (err) {
    console.error('Reset password error:', err)
    return { success: false, error: 'Failed to reset password. Please try again.' }
  }
}
