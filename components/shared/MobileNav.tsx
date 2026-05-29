'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  Bell,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  Bell,
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-50',
        'bg-[#151922] border-t border-white/8',
        'safe-area-pb',
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch h-16">
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
                'flex-1 flex flex-col items-center justify-center gap-1 px-1',
                'transition-colors duration-150',
                isActive ? 'text-[#a3ff3f]' : 'text-[#8b95a5]',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && (
                <Icon
                  size={20}
                  className="flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#a3ff3f]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
