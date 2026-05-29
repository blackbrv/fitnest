'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateInviteCode } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ActionResult } from '@/types'
import { MAX_FAMILY_MEMBERS } from '@/constants'

const createFamilySchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters').max(50, 'Family name must be 50 characters or less').trim(),
})

const joinFamilySchema = z.object({
  inviteCode: z.string().length(8, 'Invite code must be exactly 8 characters').toUpperCase().trim(),
})

export async function createFamily(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in to create a family.' }
  }

  const raw = {
    familyName: formData.get('familyName') as string,
  }

  const parsed = createFamilySchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { familyName } = parsed.data

  try {
    // Check if user is already in a family
    const existingMembership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })
    if (existingMembership) {
      return { success: false, error: 'You are already a member of a family. Leave your current family first.' }
    }

    const inviteCode = generateInviteCode()

    const family = await db.family.create({
      data: {
        familyName,
        inviteCode,
        ownerId: session.userId,
      },
    })

    await db.familyMember.create({
      data: {
        familyId: family.id,
        userId: session.userId,
        role: 'OWNER',
      },
    })
  } catch (error) {
    console.error('[createFamily]', error)
    return { success: false, error: 'Failed to create family. Please try again.' }
  }

  revalidatePath('/family-management')
  redirect('/family-management')
}

export async function joinFamily(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in to join a family.' }
  }

  const raw = {
    inviteCode: formData.get('inviteCode') as string,
  }

  const parsed = joinFamilySchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { inviteCode } = parsed.data

  try {
    // Check if user is already in a family
    const existingMembership = await db.familyMember.findFirst({
      where: { userId: session.userId },
    })
    if (existingMembership) {
      return { success: false, error: 'You are already a member of a family. Leave your current family first.' }
    }

    // Find family by invite code
    const family = await db.family.findUnique({
      where: { inviteCode },
      include: { members: true },
    })

    if (!family) {
      return { success: false, error: 'Invalid invite code. Please check and try again.' }
    }

    // Check member limit
    if (family.members.length >= MAX_FAMILY_MEMBERS) {
      return { success: false, error: `This family has reached the maximum of ${MAX_FAMILY_MEMBERS} members.` }
    }

    await db.familyMember.create({
      data: {
        familyId: family.id,
        userId: session.userId,
        role: 'MEMBER',
      },
    })
  } catch (error) {
    console.error('[joinFamily]', error)
    return { success: false, error: 'Failed to join family. Please try again.' }
  }

  revalidatePath('/family-management')
  redirect('/family-management')
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in.' }
  }

  try {
    // Find the target member
    const targetMember = await db.familyMember.findUnique({
      where: { id: memberId },
    })

    if (!targetMember) {
      return { success: false, error: 'Member not found.' }
    }

    // Verify the caller is OWNER of this family
    const callerMembership = await db.familyMember.findFirst({
      where: {
        familyId: targetMember.familyId,
        userId: session.userId,
        role: 'OWNER',
      },
    })

    if (!callerMembership) {
      return { success: false, error: 'Only the family owner can remove members.' }
    }

    // Cannot remove yourself (the owner)
    if (targetMember.userId === session.userId) {
      return { success: false, error: 'You cannot remove yourself as owner. Delete the family instead.' }
    }

    await db.familyMember.delete({
      where: { id: memberId },
    })
  } catch (error) {
    console.error('[removeMember]', error)
    return { success: false, error: 'Failed to remove member. Please try again.' }
  }

  revalidatePath('/family-management')
  return { success: true }
}

export async function leaveFamily(familyId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'You must be signed in.' }
  }

  try {
    const membership = await db.familyMember.findFirst({
      where: {
        familyId,
        userId: session.userId,
      },
    })

    if (!membership) {
      return { success: false, error: 'You are not a member of this family.' }
    }

    if (membership.role === 'OWNER') {
      return { success: false, error: 'As the owner, you cannot leave the family. Transfer ownership or delete the family first.' }
    }

    await db.familyMember.delete({
      where: { id: membership.id },
    })
  } catch (error) {
    console.error('[leaveFamily]', error)
    return { success: false, error: 'Failed to leave family. Please try again.' }
  }

  redirect('/family-management')
}
