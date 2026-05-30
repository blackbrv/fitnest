'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { resendVerificationEmail } from '@/server/actions/auth'
import { cn } from '@/lib/utils'

export default function VerifyEmailPendingPage() {
  const searchParams = useSearchParams()
  const emailFromParam = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(emailFromParam)
  const [isPending, startTransition] = useTransition()
  const [resendState, setResendState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleResend() {
    if (!email) return
    setResendState('idle')
    startTransition(async () => {
      const result = await resendVerificationEmail(email)
      if (result.success) {
        setResendState('sent')
      } else {
        setResendState('error')
        setErrorMsg(result.error ?? 'Failed to resend. Please try again.')
      }
    })
  }

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="flex justify-center mb-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
          <Mail size={32} className="text-primary" />
        </span>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
      <p className="text-sm text-muted mb-8 leading-relaxed">
        We sent a verification link to{' '}
        {emailFromParam ? (
          <span className="font-medium text-foreground">{emailFromParam}</span>
        ) : (
          'your email address'
        )}
        . Click the link in the email to activate your account.
      </p>

      {/* Resend section */}
      <div className="rounded-2xl border border-border bg-surface-2/40 p-5 mb-6 text-left">
        <p className="text-sm font-medium text-foreground mb-3">Didn&apos;t receive it?</p>

        {!emailFromParam && (
          <div className="mb-3">
            <label className="block text-xs text-muted mb-1.5">Your email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                'h-10 w-full rounded-xl px-3.5 text-sm',
                'bg-surface-2/60 text-foreground placeholder:text-muted',
                'border border-border outline-none',
                'focus:ring-1 focus:ring-primary/60 focus:border-primary/60',
                'transition-colors duration-150',
              )}
            />
          </div>
        )}

        {resendState === 'sent' ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400">Verification email sent!</p>
          </div>
        ) : (
          <>
            {resendState === 'error' && (
              <p className="text-xs text-red-400 mb-2">{errorMsg}</p>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={isPending || !email}
              className={cn(
                'inline-flex items-center justify-center gap-2 h-10 w-full rounded-xl',
                'border border-border bg-surface-2/60 text-sm font-medium text-foreground',
                'hover:bg-surface-2 transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Resend verification email
            </button>
          </>
        )}
        <p className="text-xs text-muted mt-2.5">
          Check your spam folder. Links expire after 24 hours.
        </p>
      </div>

      <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">
        Back to sign in
      </Link>
    </div>
  )
}
