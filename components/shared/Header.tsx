'use client'

import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useAppStore } from '@/store'
import { NAV_ITEMS, ROUTES } from '@/constants'

interface HeaderProps {
  userName: string
  userEmail: string
}

function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href)),
  )
  if (match) return match.label

  if (pathname.startsWith('/profile')) return 'Profile'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'FitNest'
}

export function Header({ userName, userEmail }: HeaderProps) {
  const pathname = usePathname()
  const unreadCount = useAppStore((s) => s.unreadCount)
  const pageTitle = getPageTitle(pathname)
  const initials = getInitials(userName)

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'flex items-center justify-between',
        'h-16 px-4 md:px-6',
        'bg-[#0f1115]/80 backdrop-blur-md',
        'border-b border-white/8',
      )}
    >
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-[#f5f7fa]">{pageTitle}</h1>
        <p className="text-xs text-[#8b95a5] hidden sm:block">
          Welcome back, {userName.split(' ')[0]}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Link
          href={ROUTES.NOTIFICATIONS}
          className={cn(
            'relative flex items-center justify-center',
            'w-9 h-9 rounded-xl',
            'text-[#8b95a5] hover:text-[#f5f7fa]',
            'hover:bg-white/5 transition-colors duration-150',
          )}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5',
                'flex items-center justify-center',
                'min-w-[16px] h-4 px-0.5 rounded-full',
                'bg-[#a3ff3f] text-[#0f1115]',
                'text-[9px] font-bold leading-none',
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User avatar */}
        <Link
          href={ROUTES.PROFILE}
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full',
            'flex items-center justify-center',
            'bg-[#1c2433] text-[#a3ff3f] text-sm font-semibold',
            'ring-1 ring-white/10',
            'hover:ring-[#a3ff3f]/40 transition-all duration-150',
          )}
          aria-label={`${userName} — go to profile`}
          title={userEmail}
        >
          {initials}
        </Link>
      </div>
    </header>
  )
}
