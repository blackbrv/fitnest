import type { Metadata } from 'next'
import { ScaleIn } from '@/components/ui/Motion'

export const metadata: Metadata = {
  title: 'FitNest — Get Started',
  description: 'Sign in or create your FitNest account to start your family fitness journey.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#a3ff3f] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 10h2M15 10h2M5 10a5 5 0 1 0 10 0A5 5 0 0 0 5 10ZM10 5V3M10 17v-2"
                  stroke="#0f1115"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              FitNest
            </span>
          </div>
          <p className="text-sm text-muted">
            Your family&apos;s fitness journey starts here
          </p>
        </div>

        <ScaleIn>{children}</ScaleIn>
      </div>
    </div>
  )
}
