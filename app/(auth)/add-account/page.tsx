import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Add Account',
}

export default function AddAccountPage() {
  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-sm text-muted font-medium uppercase tracking-wider mb-2">
          Add another account
        </p>
        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        <p className="text-sm text-muted mt-1">
          Sign in to add a second account to this device
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
          Back to dashboard
        </Link>
      </p>
    </div>
  )
}
