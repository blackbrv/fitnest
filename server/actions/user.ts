'use server'

import { db } from '@/lib/db'
import { createSession, getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ActionResult } from '@/types'

const MAX_AVATAR_SIZE = 2_097_152 // 2MB base64 limit

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  avatar: z
    .string()
    .refine(
      (v) => !v || v.startsWith('data:image/') || v.startsWith('/'),
      'Invalid image format',
    )
    .refine(
      (v) => !v || v.length <= MAX_AVATAR_SIZE,
      'Image is too large (max 2MB)',
    )
    .optional(),
})

export async function updateProfile(formData: {
  name: string
  bio?: string
  avatar?: string
}): Promise<ActionResult<{ name: string; bio: string | null; avatar: string | null }>> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Not authenticated' }
  }

  const parsed = updateProfileSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { name, bio, avatar } = parsed.data

  try {
    const updateData: { name: string; bio?: string | null; avatar?: string | null } = { name }
    if (bio !== undefined) updateData.bio = bio || null
    if (avatar !== undefined) updateData.avatar = avatar || null

    const updated = await db.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { name: true, bio: true, avatar: true },
    })

    // Refresh session with updated name
    await createSession({
      userId: session.userId,
      email: session.email,
      name: updated.name,
    })

    revalidatePath('/profile')
    revalidatePath('/settings')
    revalidatePath('/dashboard')

    return { success: true, data: updated }
  } catch (err) {
    console.error('[updateProfile]', err)
    return { success: false, error: 'Failed to update profile. Please try again.' }
  }
}

// Separate action just for avatar (allows clearing it)
export async function updateAvatar(avatarDataUrl: string | null): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Not authenticated' }

  if (avatarDataUrl && !avatarDataUrl.startsWith('data:image/')) {
    return { success: false, error: 'Invalid image format' }
  }
  if (avatarDataUrl && avatarDataUrl.length > MAX_AVATAR_SIZE) {
    return { success: false, error: 'Image is too large' }
  }

  try {
    await db.user.update({
      where: { id: session.userId },
      data: { avatar: avatarDataUrl },
    })
    revalidatePath('/profile')
    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('[updateAvatar]', err)
    return { success: false, error: 'Failed to update avatar' }
  }
}
