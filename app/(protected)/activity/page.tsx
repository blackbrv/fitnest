import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { cn, getInitials } from '@/lib/utils'
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
  ListFilter,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Activity — FitNest',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkoutStatus = 'COMPLETED' | 'SKIPPED' | 'IN_PROGRESS'

interface ActivityRow {
  id: string
  memberName: string
  status: WorkoutStatus
  workoutTitle: string
  category: string | null
  dateLabel: string   // "Today", "Yesterday", "Mon, May 26"
  timeLabel: string   // "2:30 PM"
  sortKey: number     // timestamp for sorting
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  WorkoutStatus,
  { icon: React.ElementType; label: string; badgeClass: string; iconClass: string }
> = {
  COMPLETED: {
    icon: CheckCircle2,
    label: 'Completed',
    badgeClass: 'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/20',
    iconClass: 'text-emerald-400',
  },
  SKIPPED: {
    icon: XCircle,
    label: 'Skipped',
    badgeClass: 'bg-white/6 text-[#8b95a5] ring-1 ring-white/10',
    iconClass: 'text-[#8b95a5]',
  },
  IN_PROGRESS: {
    icon: Clock,
    label: 'In Progress',
    badgeClass: 'bg-amber-500/12 text-amber-400 ring-1 ring-amber-500/20',
    iconClass: 'text-amber-400',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  STRENGTH: 'Strength',
  CARDIO: 'Cardio',
  STRETCHING: 'Stretching',
  MOBILITY: 'Mobility',
  KIDS_EXERCISE: 'Kids',
  RECOVERY: 'Recovery',
}

const CATEGORY_COLORS: Record<string, string> = {
  STRENGTH:     'bg-blue-500/12 text-blue-400',
  CARDIO:       'bg-orange-500/12 text-orange-400',
  STRETCHING:   'bg-purple-500/12 text-purple-400',
  MOBILITY:     'bg-cyan-500/12 text-cyan-400',
  KIDS_EXERCISE:'bg-pink-500/12 text-pink-400',
  RECOVERY:     'bg-green-500/12 text-green-400',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateLabel(date: Date, now: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const n = new Date(now)
  n.setHours(0, 0, 0, 0)
  const diff = Math.round((n.getTime() - d.getTime()) / 86_400_000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function toTimeLabel(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getActivityRows(
  userId: string,
  statusFilter: string | undefined,
): Promise<{ rows: ActivityRow[]; totalCount: number }> {
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

    if (!membership) return { rows: [], totalCount: 0 }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memberUserIds = membership.family.members.map((m: any) => m.userId as string)
    const memberNameMap = new Map<string, string>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      membership.family.members.map((m: any) => [m.userId as string, m.user.name as string]),
    )

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const validStatuses = ['COMPLETED', 'SKIPPED', 'IN_PROGRESS']
    const statusWhere =
      statusFilter && validStatuses.includes(statusFilter.toUpperCase())
        ? { status: statusFilter.toUpperCase() as WorkoutStatus }
        : {}

    const logs = await db.workoutLog.findMany({
      where: {
        userId: { in: memberUserIds },
        createdAt: { gte: thirtyDaysAgo },
        ...statusWhere,
      },
      orderBy: { createdAt: 'desc' },
      include: { workoutPlan: { select: { title: true, category: true } } },
    })

    const now = new Date()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: ActivityRow[] = (logs as any[]).map((log) => {
      const ts = new Date(log.completedAt ?? log.createdAt)
      return {
        id: log.id,
        memberName: memberNameMap.get(log.userId) ?? 'Unknown',
        status: log.status as WorkoutStatus,
        workoutTitle: log.workoutPlan?.title ?? '—',
        category: log.workoutPlan?.category ?? null,
        dateLabel: toDateLabel(ts, now),
        timeLabel: toTimeLabel(ts),
        sortKey: ts.getTime(),
      }
    })

    return { rows, totalCount: rows.length }
  } catch (err) {
    console.error('[getActivityRows]', err)
    return { rows: [], totalCount: 0 }
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkoutStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.SKIPPED
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        cfg.badgeClass,
      )}
    >
      <Icon size={11} className={cfg.iconClass} />
      {cfg.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return <span className="text-xs text-[#8b95a5]">—</span>
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        CATEGORY_COLORS[category] ?? 'bg-white/6 text-[#8b95a5]',
      )}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  )
}

function MemberAvatar({ name, status }: { name: string; status: WorkoutStatus }) {
  const ringClass =
    status === 'COMPLETED'
      ? 'ring-emerald-400/25'
      : status === 'IN_PROGRESS'
      ? 'ring-amber-400/25'
      : 'ring-white/10'
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        'bg-[#1c2433] text-[10px] font-bold text-[#f5f7fa] ring-1',
        ringClass,
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </span>
  )
}

// ─── Filter tabs (client interaction handled via search params) ────────────────

const FILTERS = [
  { label: 'All',       value: undefined },
  { label: 'Completed', value: 'completed' },
  { label: 'Skipped',   value: 'skipped' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { status } = await searchParams
  const { rows, totalCount } = await getActivityRows(session.userId, status)

  const activeFilter = status?.toLowerCase()

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#8b95a5] hover:text-[#f5f7fa] transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f7fa]">All Activity</h1>
          <p className="text-sm text-[#8b95a5] mt-1">
            Family workout history · last 30 days
          </p>
        </div>
        {totalCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#1c2433] border border-white/8 px-3 py-1.5 text-xs font-semibold text-[#f5f7fa] self-center">
            <ListFilter size={12} className="text-[#8b95a5]" />
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTERS.map((f) => {
          const isActive = f.value === activeFilter || (!f.value && !activeFilter)
          const href = f.value ? `/activity?status=${f.value}` : '/activity'
          return (
            <Link
              key={f.label}
              href={href}
              className={cn(
                'h-8 px-3.5 rounded-xl text-xs font-medium transition-colors duration-150',
                isActive
                  ? 'bg-[#a3ff3f]/15 text-[#a3ff3f] ring-1 ring-[#a3ff3f]/25'
                  : 'bg-[#1c2433] text-[#8b95a5] hover:text-[#f5f7fa] hover:bg-[#242e40]',
              )}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {rows.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-[#151922] p-12 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c2433]">
            <Dumbbell size={22} className="text-[#8b95a5]" />
          </span>
          <p className="text-sm font-semibold text-[#f5f7fa]">No activity found</p>
          <p className="text-xs text-[#8b95a5] max-w-xs">
            {activeFilter
              ? `No ${activeFilter} workouts in the last 30 days.`
              : 'Complete your first workout to see activity here.'}
          </p>
          {activeFilter && (
            <Link
              href="/activity"
              className="mt-1 text-xs text-[#a3ff3f] hover:underline"
            >
              Clear filter
            </Link>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <>
          {/* ── Desktop / tablet table (md+) ───────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-white/8 bg-[#151922] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-[#1c2433]/50">
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#8b95a5] uppercase tracking-widest w-[180px]">
                    Date & Time
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#8b95a5] uppercase tracking-widest">
                    Member
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#8b95a5] uppercase tracking-widest">
                    Workout
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#8b95a5] uppercase tracking-widest w-[120px]">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#8b95a5] uppercase tracking-widest w-[130px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#1c2433]/40 transition-colors duration-100"
                  >
                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-xs font-medium text-[#f5f7fa]">{row.dateLabel}</p>
                      <p className="text-[11px] text-[#8b95a5] mt-0.5">{row.timeLabel}</p>
                    </td>

                    {/* Member */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar name={row.memberName} status={row.status} />
                        <span className="text-sm font-medium text-[#f5f7fa] truncate max-w-[120px]">
                          {row.memberName}
                        </span>
                      </div>
                    </td>

                    {/* Workout */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#f5f7fa] truncate max-w-[220px]">
                        {row.workoutTitle}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={row.category} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div className="border-t border-white/8 px-5 py-3 bg-[#1c2433]/20">
              <p className="text-[11px] text-[#8b95a5]">
                Showing {rows.length} {rows.length === 1 ? 'entry' : 'entries'} · last 30 days
              </p>
            </div>
          </div>

          {/* ── Mobile card list (<md) ──────────────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {rows.map((row) => {
              const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.SKIPPED
              const Icon = cfg.icon
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-white/8 bg-[#151922] px-4 py-3.5"
                >
                  {/* Top row: avatar + name + status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MemberAvatar name={row.memberName} status={row.status} />
                      <span className="text-sm font-semibold text-[#f5f7fa] truncate">
                        {row.memberName}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
                        cfg.badgeClass,
                      )}
                    >
                      <Icon size={10} className={cfg.iconClass} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Workout name */}
                  <p className="text-sm font-medium text-[#f5f7fa] truncate mb-2">
                    {row.workoutTitle}
                  </p>

                  {/* Footer: category + date */}
                  <div className="flex items-center justify-between gap-2">
                    <CategoryBadge category={row.category} />
                    <span className="text-[11px] text-[#8b95a5] whitespace-nowrap">
                      {row.dateLabel} · {row.timeLabel}
                    </span>
                  </div>
                </div>
              )
            })}

            <p className="text-center text-[11px] text-[#8b95a5] pt-2">
              {rows.length} {rows.length === 1 ? 'entry' : 'entries'} · last 30 days
            </p>
          </div>
        </>
      )}
    </div>
  )
}
