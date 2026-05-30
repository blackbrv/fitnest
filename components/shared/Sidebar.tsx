'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  Bell,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants'
import { SessionPayload } from '@/types'
import { deleteSession } from '@/lib/auth'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  Bell,
}

interface SidebarProps {
  session: SessionPayload
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await deleteSession()
    router.push('/login')
    router.refresh()
  }

  const initials = getInitials(session.name)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col',
        'fixed inset-y-0 left-0 z-40',
        'w-[240px] bg-[#151922]',
        'border-r border-white/8',
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5 border-b border-white/8 group hover:opacity-90 transition-opacity"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#a3ff3f] flex items-center justify-center shadow-[0_0_12px_rgba(163,255,63,0.35)] group-hover:shadow-[0_0_18px_rgba(163,255,63,0.55)] transition-shadow">
          <svg
            width="18"
            height="18"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <polygon points="18,4 9,17 16,17 14,28 23,15 16,15" fill="#0f1115" />
          </svg>
        </div>
        <span className="text-lg font-bold text-[#f5f7fa] tracking-tight">
          Fit<span className="text-[#a3ff3f]">Nest</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-150',
                isActive
                  ? 'text-[#a3ff3f] bg-[#a3ff3f]/10'
                  : 'text-[#8b95a5] hover:text-[#f5f7fa] hover:bg-white/5',
              )}
            >
              {Icon && (
                <Icon
                  size={18}
                  className={cn(
                    'flex-shrink-0 transition-colors duration-150',
                    isActive ? 'text-[#a3ff3f]' : 'text-current',
                  )}
                />
              )}
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a3ff3f]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <span
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-full',
              'flex items-center justify-center',
              'bg-[#1c2433] text-[#a3ff3f] text-sm font-semibold',
              'ring-1 ring-white/10',
            )}
            aria-label={session.name}
          >
            {initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#f5f7fa] truncate">
              {session.name}
            </p>
            <p className="text-xs text-[#8b95a5] truncate">{session.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            'mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-sm font-medium text-[#8b95a5]',
            'hover:text-red-400 hover:bg-red-500/10',
            'transition-all duration-150',
          )}
        >
          <LogOut size={16} className="flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
