import { CheckCircle2 } from 'lucide-react'

const benefits = [
  'Track every family member from one account',
  'Age-appropriate workouts for kids and adults',
  'Shared goals that build accountability together',
  'Compete in family challenges and leaderboards',
  'Private family space — no public social feed',
  'Works for any family size, from 2 to 10+ members',
]

const stats = [
  { value: '2.4K', label: 'Active Families', sub: 'and growing every day' },
  { value: '89%', label: 'Consistency Rate', sub: 'vs 23% for solo trackers' },
  { value: '4.8M', label: 'Workouts Logged', sub: 'across all families' },
]

export default function FamilyBenefitsSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#0F1115] overflow-hidden">
      {/* Diagonal accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A3FF3F]/15 to-transparent" />

      {/* Right side glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[600px] rounded-full bg-[#A3FF3F]/[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Copy & benefits */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#A3FF3F] mb-4">
              Why Families Love FitNest
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#F5F7FA] tracking-tight leading-tight mb-6">
              Fitness starts{' '}
              <span className="text-[#A3FF3F] drop-shadow-[0_0_20px_rgba(163,255,63,0.35)]">
                at home
              </span>
            </h2>
            <p className="text-[#8b95a5] text-base leading-relaxed mb-10">
              Solo fitness apps leave family members isolated. FitNest ties everyone together with
              shared momentum, making healthy habits contagious rather than optional.
            </p>

            {/* Benefits list */}
            <ul className="flex flex-col gap-3.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-4.5 h-4.5 text-[#A3FF3F] shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span className="text-[#8b95a5] text-sm leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Stats */}
          <div className="flex flex-col gap-5">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`relative bg-[#151922] border rounded-3xl p-7 overflow-hidden transition-all duration-300 ${
                  i === 1
                    ? 'border-[#A3FF3F]/25 shadow-[0_0_40px_rgba(163,255,63,0.06)]'
                    : 'border-white/[0.07]'
                }`}
              >
                {/* Decorative corner accent */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none"
                  style={{
                    background:
                      i === 1
                        ? 'rgba(163,255,63,0.08)'
                        : i === 2
                        ? 'rgba(125,211,252,0.05)'
                        : 'rgba(163,255,63,0.04)',
                  }}
                />

                <div className="relative">
                  <p
                    className="text-5xl lg:text-6xl font-extrabold mb-1 tracking-tight"
                    style={{
                      color:
                        i === 0 ? '#A3FF3F' : i === 1 ? '#A3FF3F' : '#A3FF3F',
                      textShadow:
                        i === 1 ? '0 0 30px rgba(163,255,63,0.4)' : 'none',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-base font-bold text-[#F5F7FA] mb-1">{stat.label}</p>
                  <p className="text-xs text-[#8b95a5]">{stat.sub}</p>
                </div>

                {/* Subtle progress line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#A3FF3F]/30 via-[#A3FF3F]/10 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
