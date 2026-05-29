'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition } from 'react'
import Link from 'next/link'
import { loginUser } from '@/server/actions/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [isPending, startTransition] = useTransition()

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
        setError('root', { message: result.error })
      }
    })
  }

  return (
    <div className="bg-[#151922] rounded-2xl border border-white/8 p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#f5f7fa]">Welcome back</h1>
        <p className="text-sm text-[#8b95a5] mt-1">
          Sign in to continue your fitness journey
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#f5f7fa]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#a3ff3f] hover:text-[#7acc2e] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-[#1c2433] border border-white/8 rounded-xl px-4 py-3 text-[#f5f7fa] placeholder-[#8b95a5] focus:outline-none focus:border-[#a3ff3f]/50 focus:ring-1 focus:ring-[#a3ff3f]/25 transition-all"
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
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
              Signing in…
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8b95a5]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-[#a3ff3f] hover:text-[#7acc2e] font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
