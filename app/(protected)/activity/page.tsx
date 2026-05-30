import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import { ChevronLeft, CheckCircle2, XCircle, Dumbbell, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Activity — FitNest',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityEntry {
  id: string
  memberName: string
  status: 'COMPLETED' | 'SKIPPED' | 'IN_PROGRESS'
  workoutTitle: string | null
  timeAgo: string
  timeLabel: string
  createdAt: Date
}

interface DayGroup {
  label: string
  entries: ActivityEntry[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDayLabel(date: Date, today: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const t = new Date(today)
  t.setHours(0, 0, 0, 0)
  const diffDays = Math.round((t.getTime() - d.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' })
  }
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getAllActivity(userId: string): Promise<DayGroup[]> {
  try {
    const membership = await db.familyMember.findFirst({
      where: { userId },
      include: {
        family: {
          include: {
            members: { include: { user: { select: { id: true, name: true } } } },
          },
        },
      },
    })

    if (!membership) return []

    const memberUserIds = membership.family.members.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m.userId as string,
    )
    const memberNameMap = new Map<string, string>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      membership.family.members.map((m: any) => [m.userId as string, m.user.name as string]),
    )

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const logs = await db.workoutLog.findMany({
      where: { userId: { in: memberUserIds }, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      include: { workoutPlan: { select: { title: true } } },
    })

    const today = new Date()
    const entries: ActivityEntry[] = logs.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (log: any) => ({
        id: log.id,
        memberName: memberNameMap.get(log.userId) ?? 'Unknown',
        status: log.status as ActivityEntry['status'],
        workoutTitle: log.workoutPlan?.title ?? null,
        timeAgo: formatRelativeTime(log.completedAt ?? log.createdAt),
        timeLabel: formatTime(log.completedAt ?? log.createdAt),
        createdAt: new Date(log.createdAt),
      }),
    )

    // Group by day
    const groups = new Map<string, ActivityEntry[]>()
    for (const entry of entries) {
      const label = getDayLabel(entry.createdAt, today)
      if (!groups.has(label)) groups.set(label, [])
      groups.get(label)!.push(entry)
    }

    return Array.from(groups.entries()).map(([label, ents]) => ({ label, entries: ents }))
  } catch (err) {
    console.error('[getAllActivity]', err)
    return []
  }
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  COMPLETED: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    dotBg: 'bg-emerald-400/15',
    ring: 'ring-emerald-400/20',
    label: 'completed',
    labelColor: 'text-emerald-400',
  },
  SKIPPED: {
    icon: XCircle,
    iconColor: 'text-[#8b95a5]',
    dotBg: 'bg-white/8',
    ring: 'ring-white/10',
    label: 'skipped',
    labelColor: 'text-[#8b95a5]',
  },
  IN_PROGRESS: {
    icon: Dumbbell,
    iconColor: 'text-amber-400',
    dotBg: 'bg-amber-400/15',
    ring: 'ring-amber-400/20',
    label: 'started',
    labelColor: 'text-amber-400',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ActivityPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const groups = await getAllActivity(session.userId)

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#8b95a5] hover:text-[#f5f7fa] transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f5f7fa]">All Activity</h1>
        <p className="text-sm text-[#8b95a5] mt-1">Family workout history for the past 30 days</p>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-[#151922] p-10 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2433]">
            <Users size={22} className="text-[#8b95a5]" />
          </span>
          <p className="text-sm font-semibold text-[#f5f7fa]">No activity yet</p>
          <p className="text-xs text-[#8b95a5] max-w-xs">
            Complete your first workout to see activity here.
          </p>
          <Link
            href="/workout-plans"
            className="mt-2 inline-flex items-center gap-1.5 h-8 px-4 rounded-xl bg-[#a3ff3f] text-[#0f1115] text-xs font-semibold hover:bg-[#b8ff5e] transition-colors"
          >
            Browse Workout Plans
          </Link>
        </div>
      )}

      {/* Day groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.label}>
            {/* Day label */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-[#8b95a5] uppercase tracking-wider">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-[10px] text-[#8b95a5]/60">
                {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {/* Entries */}
            <div className="rounded-2xl border border-white/8 bg-[#151922] divide-y divide-white/[0.05]">
              {group.entries.map((entry) => {
                const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.SKIPPED
                const Icon = cfg.icon

                return (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Avatar */}
                    <span
                      className={cn(
                        'flex-shrink-0 flex w-9 h-9 rounded-full items-center justify-center',
                        'bg-[#1c2433] text-xs font-bold text-[#f5f7fa]',
                        'ring-1',
                        cfg.ring,
                      )}
                    >
                      {getInitials(entry.memberName)}
                    </span>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f5f7fa] leading-snug">
                        <span className="font-semibold">
                          {entry.memberName.split(' ')[0]}
                        </span>{' '}
                        <span className={cn('text-xs', cfg.labelColor)}>{cfg.label}</span>{' '}
                        <span className="font-medium text-[#c8d0dc] truncate">
                          {entry.workoutTitle ?? 'a workout'}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#8b95a5]/70 mt-0.5">{entry.timeAgo}</p>
                    </div>

                    {/* Status icon + time */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          'flex w-6 h-6 rounded-full items-center justify-center',
                          cfg.dotBg,
                        )}
                      >
                        <Icon size={12} className={cfg.iconColor} />
                      </span>
                      <span className="text-[10px] text-[#8b95a5]/60">{entry.timeLabel}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
