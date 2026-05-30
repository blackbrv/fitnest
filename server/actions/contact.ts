'use server'

import { db } from '@/lib/db'
import { z } from 'zod'
import { ActionResult } from '@/types'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
})

export async function submitContact(formData: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { name, email, subject, message } = parsed.data

  try {
    await db.contactSubmission.create({
      data: { name, email, subject, message },
    })

    // Optionally send notification email if Resend is configured
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_FROM,
        subject: `[FitNest Contact] ${subject}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
      }).catch(() => {/* ignore email errors */})
    }

    return { success: true }
  } catch (err) {
    console.error('[submitContact]', err)
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}
