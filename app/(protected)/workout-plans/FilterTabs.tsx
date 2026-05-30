'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'all',      label: 'All Plans' },
  { id: 'mine',     label: 'Assigned to Me' },
  { id: 'assigned', label: 'Assigned' },
] as const

type FilterId = typeof TABS[number]['id']

interface FilterTabsProps {
  activeFilter: FilterId | string
}

export function FilterTabs({ activeFilter }: FilterTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  function navigate(id: FilterId) {
    const params = new URLSearchParams()
    if (id !== 'all') params.set('filter', id)
    router.push(id === 'all' ? pathname : `${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 w-fit mb-5">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate(tab.id)}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3ff3f]/50',
            activeFilter === tab.id
              ? 'bg-[#a3ff3f] text-[#0f1115]'
              : 'text-muted hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
