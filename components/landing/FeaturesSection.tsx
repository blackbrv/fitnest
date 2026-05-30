'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Dumbbell, TrendingUp, BarChart3, Bell } from 'lucide-react'
import { FadeInView } from '@/components/ui/Motion'

const ease = [0.21, 0.47, 0.32, 0.98] as const

const features = [
  {
    icon: LayoutDashboard,
    title: 'Shared Family Dashboard',
    description:
      'One unified view for the whole family. See everyone\'s activity, streaks, and goals at a glance — no more chasing updates.',
  },
  {
    icon: Dumbbell,
    title: 'Workout Tracking',
    description:
      'Log runs, lifts, yoga, and more. Custom workout templates built for every age and fitness level in your family.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Monitoring',
    description:
      'Watch your family\'s fitness improve over time. Weekly and monthly trends show exactly where effort is paying off.',
  },
  {
    icon: BarChart3,
    title: 'Deep Statistics',
    description:
      'Detailed analytics for each family member. Completion rates, personal bests, and consistency scores, all in one place.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Gentle nudges that actually work. Celebrate wins together and keep momentum with well-timed, non-intrusive reminders.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32 bg-background">
      {/* Subtle top separator glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-[#A3FF3F]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <FadeInView className="text-center mb-16 lg:mb-20">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#A3FF3F] mb-4">
            Platform Features
          </p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Everything your family needs
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Designed to keep every household member motivated and accountable — from beginners to athletes.
          </p>
        </FadeInView>

        {/* Feature cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            const isLast = i === features.length - 1

            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease },
                  },
                }}
                className={`group relative bg-surface border border-white/[0.07] rounded-3xl p-7 hover:border-[#A3FF3F]/20 transition-all duration-300 hover:bg-surface-3 ${
                  isLast && features.length % 3 !== 0
                    ? 'sm:col-span-2 lg:col-span-1'
                    : ''
                }`}
              >
                {/* Icon container */}
                <div className="w-12 h-12 rounded-2xl bg-[#A3FF3F]/10 border border-[#A3FF3F]/15 flex items-center justify-center mb-5 group-hover:bg-[#A3FF3F]/15 group-hover:shadow-[0_0_20px_rgba(163,255,63,0.15)] transition-all duration-300">
                  <Icon className="w-5 h-5 text-[#A3FF3F]" strokeWidth={1.75} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{feature.description}</p>

                {/* Hover glow corner */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at top left, rgba(163,255,63,0.04) 0%, transparent 60%)',
                  }}
                />
              </motion.div>
            )
          })}

          {/* 5 features → put last two in wider cards on medium screens */}
        </motion.div>

        {/* Bottom stat strip */}
        <FadeInView delay={0.1} className="mt-16 grid grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
          {[
            { value: '50+', label: 'Workout types' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '< 2s', label: 'Avg load time' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-surface px-8 py-6 text-center">
              <p className="text-2xl font-extrabold text-[#A3FF3F]">{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </FadeInView>
      </div>
    </section>
  )
}
