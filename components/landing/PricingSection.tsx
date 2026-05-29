import Link from 'next/link'
import { CheckCircle2, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try FitNest with no commitment.',
    highlight: false,
    badge: null,
    features: [
      'Up to 2 family members',
      'Basic workout logging',
      'Weekly progress summary',
      '7-day streak tracking',
      'Community workouts',
    ],
    cta: 'Get Started Free',
    ctaHref: '/register',
  },
  {
    name: 'Family',
    price: '$9.99',
    period: '/month',
    description: 'The full FitNest experience for your whole family.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 10 family members',
      'Shared family dashboard',
      'Full workout library (50+ types)',
      'Detailed stats & analytics',
      'Smart notifications',
      'Family challenges & leaderboards',
      'Progress photos',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaHref: '/register',
  },
  {
    name: 'Pro',
    price: '$24.99',
    period: '/month',
    description: 'For fitness-focused families who want it all.',
    highlight: false,
    badge: null,
    features: [
      'Everything in Family',
      'Unlimited members',
      'AI-powered workout suggestions',
      'Custom workout builder',
      'Nutrition logging',
      'Wearable device sync',
      'Dedicated coach integration',
      'White-glove onboarding',
    ],
    cta: 'Talk to Sales',
    ctaHref: '/contact',
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 bg-[#0F1115]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A3FF3F]/10 to-transparent" />

      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#A3FF3F]/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#A3FF3F] mb-4">
            Transparent Pricing
          </p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#F5F7FA] tracking-tight mb-4">
            Simple, family-first pricing
          </h2>
          <p className="text-[#8b95a5] text-base max-w-md mx-auto leading-relaxed">
            No hidden fees, no per-member charges. One price for your whole household.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-7 ${
                plan.highlight
                  ? 'bg-[#151922] border-2 border-[#A3FF3F] shadow-[0_0_60px_rgba(163,255,63,0.12)] md:-mt-4 md:-mb-4'
                  : 'bg-[#151922] border border-white/[0.07]'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 bg-[#A3FF3F] text-[#0F1115] text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-[0_0_16px_rgba(163,255,63,0.5)]">
                    <Zap className="w-2.5 h-2.5" fill="currentColor" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name & price */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#8b95a5] tracking-wide uppercase mb-3">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className={`text-5xl font-extrabold ${
                      plan.highlight ? 'text-[#A3FF3F]' : 'text-[#F5F7FA]'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#8b95a5]">{plan.period}</span>
                </div>
                <p className="text-xs text-[#8b95a5] leading-relaxed">{plan.description}</p>
              </div>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`w-full py-3 rounded-2xl text-sm font-bold text-center mb-7 transition-all duration-200 ${
                  plan.highlight
                    ? 'bg-[#A3FF3F] text-[#0F1115] hover:bg-[#b8ff5e] shadow-[0_0_20px_rgba(163,255,63,0.3)] hover:shadow-[0_0_30px_rgba(163,255,63,0.5)]'
                    : 'bg-white/[0.06] text-[#F5F7FA] hover:bg-white/[0.10] border border-white/[0.08]'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] mb-6" />

              {/* Features list */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        plan.highlight ? 'text-[#A3FF3F]' : 'text-[#8b95a5]'
                      }`}
                      strokeWidth={2}
                    />
                    <span className="text-sm text-[#8b95a5]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-[#8b95a5] mt-10">
          All plans include a 14-day free trial. No credit card required.
          Cancel anytime.
        </p>
      </div>
    </section>
  )
}
