import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { Trophy, Flame } from 'lucide-react'

interface LeaderboardMember {
  id: string
  name: string
  avatar?: string | null
  streak: number
  completionRate: number
}

interface FamilyLeaderboardProps {
  members: LeaderboardMember[]
}

const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600']
const rankBg = ['bg-yellow-400/10', 'bg-slate-300/10', 'bg-amber-600/10']

export function FamilyLeaderboard({ members }: FamilyLeaderboardProps) {
  const sorted = [...members].sort((a, b) => b.completionRate - a.completionRate)

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trophy size={32} className="text-muted mb-3" />
        <p className="text-sm text-muted">No family members yet</p>
        <p className="text-xs text-muted/60 mt-1">
          Invite your family to start competing
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((member, index) => {
        const isTopPerformer = index === 0
        const rank = index + 1
        const colorClass = rankColors[index] ?? 'text-muted'
        const bgClass = rankBg[index] ?? 'bg-white/5'
        const initials = getInitials(member.name)

        return (
          <div
            key={member.id}
            className={cn(
              'flex items-center gap-3 rounded-xl p-3 transition-colors',
              isTopPerformer
                ? 'bg-[#a3ff3f]/5 border border-[#a3ff3f]/20'
                : 'bg-surface-2/50 border border-white/5',
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                bgClass,
                colorClass,
              )}
            >
              {rank <= 3 ? (
                <Trophy size={13} />
              ) : (
                <span>{rank}</span>
              )}
            </div>

            {/* Avatar */}
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                'text-sm font-semibold ring-1',
                isTopPerformer
                  ? 'bg-[#a3ff3f]/20 text-primary ring-[#a3ff3f]/30'
                  : 'bg-surface-2 text-primary ring-white/10',
              )}
            >
              {member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </span>

            {/* Name + streak */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold truncate',
                    isTopPerformer ? 'text-foreground' : 'text-foreground',
                  )}
                >
                  {member.name}
                </span>
                {isTopPerformer && (
                  <span className="shrink-0 rounded-full bg-[#a3ff3f]/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    Top
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Flame size={11} className="text-orange-400" />
                <span>{member.streak} day streak</span>
              </div>
            </div>

            {/* Completion rate + progress bar */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={cn(
                  'text-sm font-bold',
                  isTopPerformer ? 'text-primary' : 'text-foreground',
                )}
              >
                {member.completionRate}%
              </span>
              <div className="h-1 w-20 overflow-hidden rounded-full bg-white/8">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-500 ease-out',
                    isTopPerformer ? 'bg-[#a3ff3f]' : 'bg-[#6366f1]',
                  )}
                  style={{ width: `${Math.min(100, member.completionRate)}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
