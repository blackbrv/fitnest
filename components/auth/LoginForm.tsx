'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition, useState } from 'react'
import Link from 'next/link'
import { loginUser } from '@/server/actions/auth'
import { PasswordInput } from '@/components/ui/PasswordInput'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginFormData) {
    startTransition(async () => {
      const result = await loginUser(data)
      if (result && !result.success && result.error) {
        if (result.error.startsWith('UNVERIFIED:')) {
          const email = result.error.split('UNVERIFIED:')[1]
          setUnverifiedEmail(email)
          return
        }
        setError('root', { message: result.error })
      }
    })
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted mt-1">
          Sign in to continue your fitness journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{errors.root.message}</p>
          </div>
        )}

        {unverifiedEmail && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-400 font-medium mb-1">Email not verified</p>
            <p className="text-xs text-amber-400/80 mb-3">
              Please verify your email address before logging in.
            </p>
            <Link
              href={`/verify-email/pending?email=${encodeURIComponent(unverifiedEmail)}`}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 underline"
            >
              Resend verification email →
            </Link>
          </div>
        )}

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
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-foreground placeholder-[#8b95a5] focus:outline-none focus:border-[#a3ff3f]/50 focus:ring-1 focus:ring-[#a3ff3f]/25 transition-all"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-[#7acc2e] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            {...register('password')}
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
          />
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
              Signing in…
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-primary hover:text-[#7acc2e] font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
