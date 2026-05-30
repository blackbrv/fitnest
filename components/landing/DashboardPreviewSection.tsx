import { Flame, Trophy, TrendingUp, CheckCircle2, Circle, Zap } from 'lucide-react'

const members = [
  {
    name: 'Marcus J.',
    role: 'Dad',
    avatar: 'MJ',
    color: '#A3FF3F',
    completion: 92,
    streak: 12,
    workouts: 5,
    badge: 'Elite',
    recent: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    name: 'Claire J.',
    role: 'Mom',
    avatar: 'CJ',
    color: '#7dd3fc',
    completion: 78,
    streak: 8,
    workouts: 4,
    badge: 'Consistent',
    recent: ['Mon', 'Tue', 'Thu', 'Fri'],
  },
  {
    name: 'Alex J.',
    role: 'Son · 16',
    avatar: 'AJ',
    color: '#f0abfc',
    completion: 61,
    streak: 5,
    workouts: 3,
    badge: 'Rising',
    recent: ['Tue', 'Wed', 'Fri'],
  },
  {
    name: 'Jamie J.',
    role: 'Daughter · 13',
    avatar: 'JJ',
    color: '#fbbf24',
    completion: 40,
    streak: 2,
    workouts: 2,
    badge: 'Starter',
    recent: ['Thu', 'Fri'],
  },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardPreviewSection() {
  return (
    <section id="dashboard" className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Background accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#A3FF3F]/[0.025] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 lg:mb-18">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#A3FF3F] mb-4">
            Live Preview
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight max-w-md">
              One dashboard for the{' '}
              <span className="text-[#A3FF3F] drop-shadow-[0_0_20px_rgba(163,255,63,0.4)]">
                whole family
              </span>
            </h2>
            <p className="text-muted max-w-xs text-sm leading-relaxed">
              Everything in one place. No juggling between apps, no missed milestones.
            </p>
          </div>
        </div>

        {/* Dashboard UI mockup */}
        <div className="bg-surface border border-white/[0.07] rounded-3xl overflow-hidden shadow-2xl">
          {/* Top bar / header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#A3FF3F] flex items-center justify-center shadow-[0_0_10px_rgba(163,255,63,0.4)]">
                <Zap className="w-3.5 h-3.5 text-[#0F1115]" fill="currentColor" strokeWidth={0} />
              </div>
              <span className="text-sm font-bold text-foreground">FitNest</span>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              {['Dashboard', 'Workouts', 'Stats', 'Family'].map((tab, i) => (
                <span
                  key={tab}
                  className={`text-xs font-medium ${
                    i === 0 ? 'text-[#A3FF3F]' : 'text-muted'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted hidden sm:inline">Week of May 26</span>
              <div className="w-7 h-7 rounded-full bg-[#A3FF3F]/15 border border-[#A3FF3F]/25 flex items-center justify-center text-[9px] font-bold text-[#A3FF3F]">
                MJ
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Workouts', value: '14', sub: 'this week', Icon: Trophy, color: '#A3FF3F' },
                { label: 'Family Streak', value: '12d', sub: 'personal best', Icon: Flame, color: '#fb923c' },
                { label: 'Avg Completion', value: '68%', sub: '+5% vs last week', Icon: TrendingUp, color: '#7dd3fc' },
                { label: 'Active Members', value: '4/4', sub: 'all on track', Icon: CheckCircle2, color: '#4ade80' },
              ].map(({ label, value, sub, Icon, color }) => (
                <div key={label} className="bg-surface-2 rounded-2xl p-4 border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted">{label}</span>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-muted mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Member cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {members.map((member) => (
                <div
                  key={member.name}
                  className="bg-surface-2 rounded-2xl p-4 border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                >
                  {/* Member header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-[#0F1115] shrink-0"
                      style={{ backgroundColor: member.color, boxShadow: `0 0 12px ${member.color}40` }}
                    >
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-[10px] text-muted">{member.role}</p>
                    </div>
                  </div>

                  {/* Completion ring */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-2xl font-extrabold" style={{ color: member.color }}>
                        {member.completion}%
                      </p>
                      <p className="text-[10px] text-muted">weekly goal</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-background/60 rounded-full px-2.5 py-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] font-bold text-foreground">{member.streak}d</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${member.completion}%`, backgroundColor: member.color }}
                    />
                  </div>

                  {/* Week grid */}
                  <div className="flex gap-1">
                    {weekDays.map((day) => {
                      const done = member.recent.includes(day)
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full h-5 rounded-sm flex items-center justify-center"
                            style={{
                              backgroundColor: done ? `${member.color}25` : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${done ? `${member.color}40` : 'transparent'}`,
                            }}
                          >
                            {done && (
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: member.color }}
                              />
                            )}
                          </div>
                          <span className="text-[8px] text-muted">{day[0]}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${member.color}15`,
                        color: member.color,
                        border: `1px solid ${member.color}30`,
                      }}
                    >
                      {member.badge}
                    </span>
                    <span className="text-[10px] text-muted">{member.workouts} workouts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
