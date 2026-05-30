'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition, useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { submitContact } from '@/server/actions/contact'

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type FormData = z.infer<typeof schema>

// ─── Shared input class ───────────────────────────────────────────────────────

const inputClass =
  'h-10 w-full rounded-xl px-3.5 text-sm bg-surface-2/60 text-foreground placeholder:text-muted border border-border outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-colors duration-150'

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function onSubmit(data: FormData) {
    setServerError(null)
    startTransition(async () => {
      const result = await submitContact(data)
      if (result.success) {
        setSuccess(true)
        reset()
      } else {
        setServerError(result.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {success ? (
        <div className="py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Message sent!</h3>
          <p className="text-muted text-sm leading-relaxed mb-6">
            Thanks for reaching out. We&apos;ll get back to you within 48 hours.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="text-sm text-primary hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{serverError}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Name
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              className={inputClass}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Subject
            </label>
            <input
              {...register('subject')}
              id="subject"
              type="text"
              placeholder="What's this about?"
              className={inputClass}
            />
            {errors.subject && (
              <p className="mt-1.5 text-xs text-danger">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Message
            </label>
            <textarea
              {...register('message')}
              id="message"
              rows={4}
              placeholder="Tell us more…"
              className={`${inputClass} h-auto py-2.5 resize-none`}
            />
            {errors.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.message.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-background font-semibold py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sending…
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      )}
    </div>
  )
}
