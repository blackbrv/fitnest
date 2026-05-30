'use client'

import { useState, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, KeyRound, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { resetPassword } from '@/server/actions/auth'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { cn } from '@/lib/utils'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [isPending, startTransition] = useTransition()
  const [pageState, setPageState] = useState<'form' | 'success' | 'expired' | 'invalid'>(
    token ? 'form' : 'invalid',
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(values: FormValues) {
    if (!token) return
    startTransition(async () => {
      const result = await resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      if (result.success) {
        setPageState('success')
      } else if (result.error === 'EXPIRED') {
        setPageState('expired')
      } else if (result.error === 'Invalid or expired reset link') {
        setPageState('invalid')
      } else {
        setError('root', { message: result.error ?? 'Something went wrong. Please try again.' })
      }
    })
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Password reset!</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-11 w-full rounded-xl bg-primary text-[#0f1115] font-semibold text-sm hover:brightness-105 transition-all"
        >
          Sign in to FitNest
        </Link>
      </div>
    )
  }

  // ── Expired ──────────────────────────────────────────────────────────────
  if (pageState === 'expired') {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/20">
            <XCircle size={32} className="text-amber-400" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Link expired</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          This password reset link has expired. Reset links are valid for 1 hour.
          Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center h-11 w-full rounded-xl bg-primary text-[#0f1115] font-semibold text-sm hover:brightness-105 transition-all mb-3"
        >
          Request new reset link
        </Link>
        <Link href="/login" className="block text-sm text-muted hover:text-foreground transition-colors">
          Back to sign in
        </Link>
      </div>
    )
  }

  // ── Invalid ───────────────────────────────────────────────────────────────
  if (pageState === 'invalid') {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/20">
            <XCircle size={32} className="text-red-400" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Invalid link</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          This password reset link is invalid or has already been used.
          Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center h-11 w-full rounded-xl bg-primary text-[#0f1115] font-semibold text-sm hover:brightness-105 transition-all mb-3"
        >
          Request new reset link
        </Link>
        <Link href="/login" className="block text-sm text-muted hover:text-foreground transition-colors">
          Back to sign in
        </Link>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
            <KeyRound size={26} className="text-primary" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Set new password</h1>
        <p className="text-sm text-muted">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5">
            <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{errors.root.message}</p>
          </div>
        )}

        <PasswordInput
          label="New password"
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          label="Confirm new password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'inline-flex items-center justify-center gap-2 h-11 w-full rounded-xl mt-2',
            'bg-primary text-[#0f1115] font-semibold text-sm',
            'hover:brightness-105 transition-all',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          )}
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          Reset password
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
