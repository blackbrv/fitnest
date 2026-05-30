import { Users, Flame, Trophy } from 'lucide-react'

interface FamilyStatsCardProps {
  totalMembers: number
  weeklyWorkouts: number
  mostActiveMember: string
}

export function FamilyStatsCard({
  totalMembers,
  weeklyWorkouts,
  mostActiveMember,
}: FamilyStatsCardProps) {
  const stats = [
    {
      icon: Users,
      label: 'Total Members',
      value: totalMembers.toString(),
      accent: false,
    },
    {
      icon: Flame,
      label: 'Workouts This Week',
      value: weeklyWorkouts.toString(),
      accent: true,
    },
    {
      icon: Trophy,
      label: 'Most Active',
      value: mostActiveMember,
      accent: false,
      isText: true,
    },
  ]

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <h3 className="text-foreground font-semibold text-base mb-5">Family Stats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, accent, isText }) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-xl bg-surface-2 border border-border px-4 py-4"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  accent ? 'bg-primary/10' : 'bg-white/5'
                }`}
              >
                <Icon size={16} className={accent ? 'text-primary' : 'text-muted'} />
              </div>
              <span className="text-muted text-xs font-medium">{label}</span>
            </div>
            <span
              className={`font-bold leading-none ${
                isText
                  ? 'text-foreground text-lg truncate'
                  : accent
                  ? 'text-primary text-3xl'
                  : 'text-foreground text-3xl'
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
