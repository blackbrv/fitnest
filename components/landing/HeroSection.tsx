import Link from 'next/link'
import { Play, ArrowRight, Flame, Trophy, Users } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0F1115]">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(163,255,63,1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,63,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow from center-right */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#A3FF3F]/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#A3FF3F]/[0.03] blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#A3FF3F]/10 border border-[#A3FF3F]/20 rounded-full px-4 py-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF3F] animate-pulse" />
              <span className="text-xs font-semibold text-[#A3FF3F] tracking-wide uppercase">
                Family Fitness Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#F5F7FA] leading-[1.05] tracking-tight">
              Build Stronger{' '}
              <span className="relative inline-block">
                <span className="text-[#A3FF3F] drop-shadow-[0_0_30px_rgba(163,255,63,0.4)]">
                  Habits
                </span>
              </span>{' '}
              Together
            </h1>

            {/* Subheadline */}
            <p className="text-[#8b95a5] text-lg lg:text-xl leading-relaxed max-w-xl">
              FitNest helps families stay active through shared workout planning,
              progress tracking, and accountability. One app, every milestone.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <Link
                href="/register"
                className="group flex items-center gap-2.5 bg-[#A3FF3F] text-[#0F1115] font-bold px-7 py-3.5 rounded-full text-base hover:bg-[#b8ff5e] transition-all duration-200 shadow-[0_0_24px_rgba(163,255,63,0.35)] hover:shadow-[0_0_36px_rgba(163,255,63,0.55)]"
              >
                Start Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="group flex items-center gap-3 text-[#F5F7FA] border border-white/[0.12] hover:border-white/25 rounded-full px-6 py-3.5 text-base transition-all duration-200 hover:bg-white/[0.04]"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors">
                  <Play className="w-3 h-3 fill-[#F5F7FA]" />
                </span>
                See Features
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-2">
                {['TJ', 'SM', 'MG', 'RL'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0F1115] bg-gradient-to-br from-[#1c2433] to-[#2a3347] flex items-center justify-center text-[9px] font-bold text-[#A3FF3F]"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#8b95a5]">
                <span className="text-[#F5F7FA] font-semibold">2,400+</span> families already active
              </p>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative">
            {/* Main card */}
            <div className="relative bg-[#151922] border border-white/[0.08] rounded-3xl p-5 shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-[#8b95a5]">Family Dashboard</p>
                  <p className="text-sm font-semibold text-[#F5F7FA]">Week of May 26</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#A3FF3F]/10 border border-[#A3FF3F]/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF3F]" />
                  <span className="text-xs font-semibold text-[#A3FF3F]">Live</span>
                </div>
              </div>

              {/* Member rows */}
              {[
                { name: 'Dad', workouts: 5, streak: 12, pct: 92, color: '#A3FF3F' },
                { name: 'Mom', workouts: 4, streak: 8, pct: 78, color: '#7dd3fc' },
                { name: 'Alex', workouts: 3, streak: 5, pct: 61, color: '#f0abfc' },
                { name: 'Jamie', workouts: 2, streak: 2, pct: 40, color: '#fbbf24' },
              ].map((member) => (
                <div key={member.name} className="flex items-center gap-3 mb-3 last:mb-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-[#0F1115] shrink-0"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#F5F7FA]">{member.name}</span>
                      <span className="text-xs font-bold" style={{ color: member.color }}>
                        {member.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${member.pct}%`, backgroundColor: member.color }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-[#8b95a5]">{member.streak}d</span>
                  </div>
                </div>
              ))}

              {/* Bottom stats row */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                {[
                  { label: 'Workouts', value: '14', icon: Trophy },
                  { label: 'Avg. Score', value: '68%', icon: null },
                  { label: 'Members', value: '4', icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-[#1c2433] rounded-2xl p-3">
                    <p className="text-xs text-[#8b95a5] mb-0.5">{label}</p>
                    <p className="text-base font-bold text-[#A3FF3F]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge - streak */}
            <div className="absolute -top-4 -right-4 bg-[#1c2433] border border-white/[0.1] rounded-2xl px-4 py-2.5 shadow-xl">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-xs text-[#8b95a5]">Family Streak</p>
                  <p className="text-sm font-bold text-[#F5F7FA]">12 Days</p>
                </div>
              </div>
            </div>

            {/* Floating badge - new workout */}
            <div className="absolute -bottom-4 -left-4 bg-[#A3FF3F] rounded-2xl px-4 py-2.5 shadow-[0_0_20px_rgba(163,255,63,0.4)]">
              <p className="text-xs font-bold text-[#0F1115]">+1 Workout</p>
              <p className="text-[10px] text-[#0F1115]/70">Jamie just logged</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
