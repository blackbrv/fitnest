'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition, useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/server/actions/auth'

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotFormData = z.infer<typeof forgotSchema>

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  function onSubmit(data: ForgotFormData) {
    startTransition(async () => {
      const result = await requestPasswordReset(data)
      if (result.success) {
        setSubmitted(true)
      } else if (result.error) {
        setError('root', { message: result.error })
      }
    })
  }

  if (submitted) {
    return (
      <div className="bg-[#151922] rounded-2xl border border-white/8 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#a3ff3f]/12 flex items-center justify-center mx-auto mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0-8 5-8-5m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5"
              stroke="#a3ff3f"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#f5f7fa] mb-2">Check your email</h2>
        <p className="text-sm text-[#8b95a5] mb-1">
          If an account exists for{' '}
          <span className="text-[#f5f7fa] font-medium">{getValues('email')}</span>,
          you&apos;ll receive a reset link shortly.
        </p>
        <p className="text-xs text-[#8b95a5] mt-4">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            onClick={() => setSubmitted(false)}
            className="text-[#a3ff3f] hover:text-[#7acc2e] transition-colors underline underline-offset-2"
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 text-sm text-[#8b95a5] hover:text-[#f5f7fa] transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#151922] rounded-2xl border border-white/8 p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#f5f7fa]">Reset your password</h1>
        <p className="text-sm text-[#8b95a5] mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{errors.root.message}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#f5f7fa] mb-1.5"
          >
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full bg-[#1c2433] border border-white/8 rounded-xl px-4 py-3 text-[#f5f7fa] placeholder-[#8b95a5] focus:outline-none focus:border-[#a3ff3f]/50 focus:ring-1 focus:ring-[#a3ff3f]/25 transition-all"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#a3ff3f] text-[#0f1115] font-semibold py-3 rounded-xl hover:bg-[#7acc2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
              Sending link…
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8b95a5]">
        Remember your password?{' '}
        <Link
          href="/login"
          className="text-[#a3ff3f] hover:text-[#7acc2e] font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
