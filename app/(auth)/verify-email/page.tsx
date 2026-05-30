'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react'
import { verifyEmail, resendVerificationEmail } from '@/server/actions/auth'
import { cn } from '@/lib/utils'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'invalid'>('loading')
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendError, setResendError] = useState('')

  const verify = useCallback(async () => {
    if (!token) {
      setStatus('invalid')
      return
    }
    const result = await verifyEmail(token)
    if (result.success) {
      setStatus('success')
    } else if (result.error === 'EXPIRED') {
      setStatus('expired')
    } else {
      setStatus('invalid')
    }
  }, [token])

  useEffect(() => {
    verify()
  }, [verify])

  async function handleResend() {
    // We don't have the email here — redirect to pending page with no email
    // The user can type their email there
    window.location.href = '/verify-email/pending'
  }

  if (status === 'loading') {
    return (
      <div className="text-center py-8">
        <Loader2 size={36} className="text-primary mx-auto animate-spin mb-4" />
        <p className="text-sm text-muted">Verifying your email…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Email verified!</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          Your email has been successfully verified. You can now sign in to your account.
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

  if (status === 'expired') {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/20">
            <XCircle size={32} className="text-amber-400" />
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Link expired</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          This verification link has expired. Verification links are valid for 24 hours.
          Request a new one below.
        </p>
        <Link
          href="/verify-email/pending"
          className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-primary text-[#0f1115] font-semibold text-sm hover:brightness-105 transition-all mb-3"
        >
          <RefreshCw size={15} />
          Request new verification email
        </Link>
        <Link href="/login" className="block text-sm text-muted hover:text-foreground transition-colors">
          Back to sign in
        </Link>
      </div>
    )
  }

  // invalid
  return (
    <div className="text-center">
      <div className="flex justify-center mb-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/20">
          <XCircle size={32} className="text-red-400" />
        </span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Invalid link</h1>
      <p className="text-sm text-muted mb-8 leading-relaxed">
        This verification link is invalid or has already been used.
        If you need a new link, you can request one below.
      </p>
      <Link
        href="/verify-email/pending"
        className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-primary text-[#0f1115] font-semibold text-sm hover:brightness-105 transition-all mb-3"
      >
        <Mail size={15} />
        Request new verification email
      </Link>
      <Link href="/login" className="block text-sm text-muted hover:text-foreground transition-colors">
        Back to sign in
      </Link>
    </div>
  )
}
