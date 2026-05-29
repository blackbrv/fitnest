'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ConsistencyCalendarProps {
  logs: { date: string | Date; completed: boolean }[]
}

function getLastNDays(n: number): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }
  return days
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ConsistencyCalendar({ logs }: ConsistencyCalendarProps) {
  const completedSet = useMemo(() => {
    const set = new Set<string>()
    for (const log of logs) {
      if (log.completed) {
        const d = new Date(log.date)
        d.setHours(0, 0, 0, 0)
        set.add(toDateKey(d))
      }
    }
    return set
  }, [logs])

  // Last 91 days = ~13 weeks
  const days = useMemo(() => getLastNDays(91), [])

  // Pad start so first day aligns to its weekday column
  const startDayOfWeek = days[0].getDay() // 0=Sun
  const paddedDays: (Date | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...days,
  ]

  // Build columns (weeks), each column has up to 7 days
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7))
  }

  // Month label positions: for each week-column, check if it starts a new month
  const monthPositions: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, colIndex) => {
    const firstReal = week.find((d) => d !== null) as Date | undefined
    if (firstReal && firstReal.getMonth() !== lastMonth) {
      lastMonth = firstReal.getMonth()
      monthPositions.push({ label: MONTH_LABELS[lastMonth], col: colIndex })
    }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        {/* Month labels */}
        <div className="flex mb-1 pl-8">
          {weeks.map((_, colIndex) => {
            const mp = monthPositions.find((m) => m.col === colIndex)
            return (
              <div key={colIndex} className="flex-1 min-w-[14px] max-w-[16px] mr-[2px]">
                {mp ? (
                  <span className="text-[10px] text-[#8b95a5] whitespace-nowrap">{mp.label}</span>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[2px] mr-2 mt-0">
            {DAY_LABELS.map((d, i) => (
              <div key={d} className="h-[14px] flex items-center">
                {i % 2 === 1 ? (
                  <span className="text-[10px] text-[#8b95a5] w-6">{d}</span>
                ) : (
                  <span className="w-6" />
                )}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-[2px]">
            {weeks.map((week, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-[2px]">
                {week.map((day, rowIndex) => {
                  if (!day) {
                    return <div key={rowIndex} className="h-[14px] w-[14px]" />
                  }

                  const key = toDateKey(day)
                  const isCompleted = completedSet.has(key)
                  const isToday = day.getTime() === today.getTime()
                  const isFuture = day > today

                  return (
                    <div
                      key={key}
                      title={`${key}${isCompleted ? ' — workout completed' : ''}`}
                      className={cn(
                        'h-[14px] w-[14px] rounded-[3px] transition-colors',
                        isFuture && 'opacity-0 pointer-events-none',
                        !isFuture && !isCompleted && 'bg-white/8 hover:bg-white/14',
                        isCompleted && 'bg-[#a3ff3f] hover:bg-[#b5ff5a]',
                        isToday && !isCompleted && 'ring-1 ring-[#a3ff3f]/60',
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-3 justify-end">
          <span className="text-[11px] text-[#8b95a5]">Less</span>
          {[0.15, 0.35, 0.6, 0.85, 1].map((opacity) => (
            <div
              key={opacity}
              className="h-[12px] w-[12px] rounded-[3px]"
              style={{
                backgroundColor: opacity < 0.3
                  ? 'rgba(255,255,255,0.08)'
                  : `rgba(163, 255, 63, ${opacity})`,
              }}
            />
          ))}
          <span className="text-[11px] text-[#8b95a5]">More</span>
        </div>
      </div>
    </div>
  )
}
