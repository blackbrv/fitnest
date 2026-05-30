import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Lime glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] rounded-full bg-[#A3FF3F]/[0.07] blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(163,255,63,1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,63,1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Top/bottom borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A3FF3F]/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A3FF3F]/10 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#A3FF3F] shadow-[0_0_40px_rgba(163,255,63,0.5)] mb-8">
          <Zap className="w-7 h-7 text-[#0F1115]" fill="currentColor" strokeWidth={0} />
        </div>

        {/* Headline */}
        <h2 className="text-4xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-5">
          Fitness starts{' '}
          <span
            className="text-[#A3FF3F]"
            style={{ textShadow: '0 0 40px rgba(163,255,63,0.4)' }}
          >
            at home
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto mb-10">
          Join 2,400+ families already building stronger habits together. Start free today —
          no credit card required.
        </p>

        {/* CTA Button */}
        <Link
          href="/register"
          className="group inline-flex items-center gap-3 bg-[#A3FF3F] text-[#0F1115] font-bold text-lg px-10 py-4 rounded-full hover:bg-[#b8ff5e] transition-all duration-200 shadow-[0_0_30px_rgba(163,255,63,0.4)] hover:shadow-[0_0_50px_rgba(163,255,63,0.6)]"
        >
          Start Free Today
          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <p className="mt-5 text-xs text-muted">
          14-day free trial · No credit card · Cancel anytime
        </p>
      </div>
    </section>
  )
}
