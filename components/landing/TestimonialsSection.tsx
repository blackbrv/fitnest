import { Star } from 'lucide-react'

const testimonials = [
  {
    initials: 'TJ',
    family: 'The Johnson Family',
    location: 'Austin, TX',
    color: '#A3FF3F',
    quote:
      "FitNest completely changed how we approach health as a family. Our kids actually look forward to workout time now — it's become a friendly competition every week. Our family streak is at 47 days and counting!",
    workouts: 312,
    streakDays: 47,
  },
  {
    initials: 'SM',
    family: 'Sarah & Mike',
    location: 'Portland, OR',
    color: '#7dd3fc',
    quote:
      "We tried other fitness apps but nothing stuck until FitNest. Seeing each other's progress in real time is the accountability we were missing. Mike and I haven't missed a workout in two months.",
    workouts: 148,
    streakDays: 62,
  },
  {
    initials: 'GF',
    family: 'The Garcia Family',
    location: 'Miami, FL',
    color: '#f0abfc',
    quote:
      "Tracking four kids and two adults used to be chaos. Now everything is in one place. The shared dashboard is a game-changer and the kids love earning their streak badges. Absolute must-have app.",
    workouts: 524,
    streakDays: 31,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#A3FF3F] mb-4">
            Real Families, Real Results
          </p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Loved by families
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.family}
              className={`relative bg-surface border rounded-3xl p-7 flex flex-col ${
                i === 1
                  ? 'border-white/[0.12] md:-mt-4 md:-mb-4 md:shadow-[0_0_60px_rgba(0,0,0,0.4)]'
                  : 'border-white/[0.07]'
              }`}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 fill-[#A3FF3F] text-[#A3FF3F]" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-muted text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Stats row */}
              <div className="flex gap-4 mb-5 py-4 border-t border-b border-white/[0.06]">
                <div>
                  <p className="text-lg font-extrabold" style={{ color: t.color }}>
                    {t.workouts}
                  </p>
                  <p className="text-[10px] text-muted">Workouts</p>
                </div>
                <div className="w-px bg-white/[0.06]" />
                <div>
                  <p className="text-lg font-extrabold" style={{ color: t.color }}>
                    {t.streakDays}d
                  </p>
                  <p className="text-[10px] text-muted">Streak</p>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-[#0F1115] shrink-0"
                  style={{
                    backgroundColor: t.color,
                    boxShadow: `0 0 14px ${t.color}50`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.family}</p>
                  <p className="text-[10px] text-muted">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust signal */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: '4.9', label: 'App Store rating' },
            { value: '2,400+', label: 'Families active' },
            { value: '98%', label: 'Would recommend' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-extrabold text-[#A3FF3F]">{value}</p>
              <p className="text-xs text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
