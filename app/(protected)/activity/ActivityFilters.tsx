'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'

// Sentinel value meaning "no filter applied" for this dimension
const ALL = '__all'

const DATE_OPTIONS = [
  { value: ALL, label: 'Last 30 days' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
]

const CATEGORY_OPTIONS = [
  { value: ALL, label: 'All categories' },
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'STRETCHING', label: 'Stretching' },
  { value: 'MOBILITY', label: 'Mobility' },
  { value: 'KIDS_EXERCISE', label: 'Kids' },
  { value: 'RECOVERY', label: 'Recovery' },
]

const STATUS_OPTIONS = [
  { value: ALL, label: 'All statuses' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'SKIPPED', label: 'Skipped' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
]

export interface ActivityFiltersProps {
  members: { userId: string; name: string }[]
  workoutPlans: { id: string; title: string }[]
}

export function ActivityFilters({ members, workoutPlans }: ActivityFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Keep a ref to the latest searchParams to avoid stale closures in the debounce
  const paramsRef = useRef(searchParams)
  useEffect(() => { paramsRef.current = searchParams }, [searchParams])

  // Current filter values from URL
  const currentSearch = searchParams.get('search') ?? ''
  const currentMember = searchParams.get('member') ?? ''
  const currentDate = searchParams.get('date') ?? ''
  const currentWorkout = searchParams.get('workout') ?? ''
  const currentCategory = searchParams.get('category') ?? ''
  const currentStatus = searchParams.get('status') ?? ''

  // Local controlled state for the text input so keystrokes feel instant
  const [searchInput, setSearchInput] = useState(currentSearch)

  // Debounce: push search text to URL 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(paramsRef.current.toString())
      if (searchInput.trim()) {
        params.set('search', searchInput.trim())
      } else {
        params.delete('search')
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, router, pathname])

  // Immediate update for select-based filters
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(paramsRef.current.toString())
      if (value && value !== ALL) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname],
  )

  const clearAll = useCallback(() => {
    setSearchInput('')
    router.replace(pathname, { scroll: false })
  }, [router, pathname])

  const activeFilterCount = [
    currentSearch,
    currentMember,
    currentDate,
    currentWorkout,
    currentCategory,
    currentStatus,
  ].filter(Boolean).length

  const memberOptions = [
    { value: ALL, label: 'All members' },
    ...members.map((m) => ({ value: m.userId, label: m.name })),
  ]

  const workoutOptions = [
    { value: ALL, label: 'All workouts' },
    ...workoutPlans.map((w) => ({ value: w.id, label: w.title })),
  ]

  return (
    <div className="mb-5 space-y-3">
      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by member name…"
          className={cn(
            'h-10 w-full rounded-xl bg-surface-2 border border-border',
            'pl-10 pr-10 text-sm text-foreground placeholder:text-muted',
            'outline-none transition-colors duration-150',
            'focus:border-[#a3ff3f]/60 focus:ring-2 focus:ring-[#a3ff3f]/20',
          )}
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Filter dropdowns ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Label */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted shrink-0">
          <SlidersHorizontal size={13} />
          Filters
        </span>

        {/* Member */}
        <div className="w-[150px]">
          <Select
            options={memberOptions}
            value={currentMember || ALL}
            onValueChange={(v) => updateParam('member', v)}
            placeholder="Member"
          />
        </div>

        {/* Date range */}
        <div className="w-[145px]">
          <Select
            options={DATE_OPTIONS}
            value={currentDate || ALL}
            onValueChange={(v) => updateParam('date', v)}
            placeholder="Date range"
          />
        </div>

        {/* Workout */}
        <div className="w-[160px]">
          <Select
            options={workoutOptions}
            value={currentWorkout || ALL}
            onValueChange={(v) => updateParam('workout', v)}
            placeholder="Workout"
          />
        </div>

        {/* Category */}
        <div className="w-[145px]">
          <Select
            options={CATEGORY_OPTIONS}
            value={currentCategory || ALL}
            onValueChange={(v) => updateParam('category', v)}
            placeholder="Category"
          />
        </div>

        {/* Status */}
        <div className="w-[140px]">
          <Select
            options={STATUS_OPTIONS}
            value={currentStatus || ALL}
            onValueChange={(v) => updateParam('status', v)}
            placeholder="Status"
          />
        </div>

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className={cn(
              'inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl',
              'border border-red-500/30 bg-red-500/10 text-red-400',
              'text-xs font-medium transition-colors hover:bg-red-500/20',
              'shrink-0',
            )}
          >
            <X size={12} />
            Clear
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500/25 text-[10px] font-bold">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
