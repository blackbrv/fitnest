'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'How does the family system work?',
    answer:
      "One account holds your entire family. The account owner (a parent or guardian) creates the family and invites members via email or a shareable link. Each member gets their own profile, workout history, and stats — all visible on the shared family dashboard.",
  },
  {
    question: 'Can I track my kids\' workouts?',
    answer:
      "Yes. Parent accounts can log workouts on behalf of younger children, and kids with their own profile can log independently. You can also set age-appropriate workout goals for each member individually.",
  },
  {
    question: 'Is there a limit on how many family members I can add?',
    answer:
      "The Free plan supports 2 members, the Family plan supports up to 10, and the Pro plan has no limit. You can change plans at any time as your family grows.",
  },
  {
    question: 'What types of workouts does FitNest support?',
    answer:
      "FitNest supports 50+ workout types including running, strength training, yoga, cycling, swimming, HIIT, stretching, and more. You can also create fully custom workouts using the workout builder (Pro plan).",
  },
  {
    question: 'Does FitNest connect with wearables or other fitness apps?',
    answer:
      "Pro plan users can sync with Apple Health, Google Fit, Fitbit, Garmin, and Whoop. Wearable integration is on the roadmap for the Family plan in Q3 2026.",
  },
  {
    question: 'Is my family\'s data private?',
    answer:
      "Completely. FitNest is a private family space — there is no public social feed. Your family's data is only visible to members of your family group. We are GDPR and CCPA compliant and never sell your data.",
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes. There are no contracts or commitments. Cancel from your account settings at any time. If you cancel a paid plan, you keep access until the end of your billing period and then drop to the Free plan.",
  },
  {
    question: 'Do you offer a free trial?',
    answer:
      "Every paid plan comes with a 14-day free trial, no credit card required. You can also start on the Free plan and upgrade whenever you're ready.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-24 lg:py-32 bg-[#0F1115]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#A3FF3F] mb-4">
            FAQ
          </p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
            Questions answered
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`bg-[#151922] border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isOpen ? 'border-[#A3FF3F]/20' : 'border-white/[0.07]'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-sm font-semibold leading-snug transition-colors ${
                      isOpen ? 'text-[#F5F7FA]' : 'text-[#8b95a5]'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 ${
                      isOpen
                        ? 'bg-[#A3FF3F]/15 border-[#A3FF3F]/30 text-[#A3FF3F]'
                        : 'border-white/[0.1] text-[#8b95a5]'
                    }`}
                  >
                    {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-[#8b95a5] text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[#8b95a5]">
            Still have questions?{' '}
            <a
              href="mailto:hello@fitnest.app"
              className="text-[#A3FF3F] hover:underline font-medium"
            >
              Email our team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
