'use server'

import { db } from '@/lib/db'
import { getSession, createSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ActionResult } from '@/types'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
})

export async function updateProfile(formData: {
  name: string
}): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = updateProfileSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' }
  }

  const { name } = parsed.data

  try {
    await db.user.update({
      where: { id: session.userId },
      data: { name },
    })

    // Refresh the session with updated name
    await createSession({ userId: session.userId, email: session.email, name })

    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to update profile' }
  }
}
