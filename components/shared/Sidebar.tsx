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
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#a3ff3f] flex items-center justify-center">
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
        <span className="text-lg font-bold text-[#f5f7fa] tracking-tight">
          Fit<span className="text-[#a3ff3f]">Nest</span>
        </span>
      </div>

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
