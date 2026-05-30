import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, TrendingUp, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — FitNest',
}

const values = [
  {
    icon: Users,
    title: 'Family First',
    body: 'Fitness is more fun when you do it together. FitNest puts family coordination at the centre, so every workout is a shared win.',
  },
  {
    icon: TrendingUp,
    title: 'Consistency Over Intensity',
    body: 'Small, daily actions compound into life-changing results. We help families build habits, not just complete workouts.',
  },
  {
    icon: BarChart3,
    title: 'Progress for Everyone',
    body: 'Whether you\'re a beginner or an athlete, every fitness level is valid. FitNest adapts to each family member\'s pace.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl leading-tight">
          Built for families who<br className="hidden sm:block" /> move together.
        </h1>
        <p className="mt-5 text-lg text-muted leading-relaxed max-w-2xl mx-auto">
          FitNest is a family fitness platform that makes it easy to track workouts,
          celebrate progress, and stay accountable as a household — not just as individuals.
        </p>
      </div>

      {/* Mission card */}
      <div className="mb-16">
        <div className="rounded-2xl border border-border bg-surface p-6 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
          <p className="text-muted leading-relaxed">
            Most fitness apps are designed for individuals. They track your steps, your reps,
            your streaks — but they ignore the people you live with. FitNest was built because
            the most powerful motivator in fitness isn&apos;t a leaderboard or a badge: it&apos;s
            the people at the dinner table asking how your workout went. We believe that when
            a family moves together, everyone gets further.
          </p>
        </div>
      </div>

      {/* Values grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">What we stand for</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">The story behind FitNest</h2>
        <p className="text-muted leading-relaxed">
          FitNest was born out of a real frustration: keeping a whole household active is hard.
          Different schedules, different fitness levels, different goals. We kept jumping between
          apps — one for the adults, another for the kids, a group chat for accountability.
          Nothing tied it all together. So we built FitNest: one place where a family can plan
          workouts, track who completed what, and actually see progress as a unit. The result is
          a platform that makes fitness feel like something you do for each other, not just for
          yourself.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Start your family&apos;s fitness journey
        </h2>
        <p className="text-muted mb-6 leading-relaxed">
          Join thousands of families building healthier habits together.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-background font-semibold hover:bg-primary-dark transition-colors"
        >
          Get started for free
        </Link>
      </div>
    </div>
  )
}
