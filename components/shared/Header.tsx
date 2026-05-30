'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useAppStore } from '@/store'
import { NAV_ITEMS, ROUTES } from '@/constants'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface HeaderProps {
  userName: string
  userEmail: string
  userAvatar?: string | null
}

function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href)),
  )
  if (match) return match.label

  if (pathname.startsWith('/activity')) return 'Activity'
  if (pathname.startsWith('/profile')) return 'Profile'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'FitNest'
}

export function Header({ userName, userEmail, userAvatar }: HeaderProps) {
  const pathname = usePathname()
  const unreadCount = useAppStore((s) => s.unreadCount)
  const pageTitle = getPageTitle(pathname)
  const initials = getInitials(userName)
  const [avatarError, setAvatarError] = useState(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'flex items-center justify-between',
        'h-16 px-4 md:px-6',
        'bg-background/80 backdrop-blur-md',
        'border-b border-border',
      )}
    >
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
        <p className="text-xs text-muted hidden sm:block">
          Welcome back, {userName.split(' ')[0]}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <Link
          href={ROUTES.NOTIFICATIONS}
          className={cn(
            'relative flex items-center justify-center',
            'w-9 h-9 rounded-xl',
            'text-muted hover:text-foreground',
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
            'flex-shrink-0 w-9 h-9 rounded-full overflow-hidden',
            'flex items-center justify-center',
            'bg-surface-2 text-primary text-sm font-semibold',
            'ring-1 ring-white/10',
            'hover:ring-[#a3ff3f]/40 transition-all duration-150',
          )}
          aria-label={`${userName} — go to profile`}
          title={userEmail}
        >
          {userAvatar && !avatarError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userAvatar}
              alt={userName}
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            initials
          )}
        </Link>
      </div>
    </header>
  )
}
