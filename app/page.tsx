import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DashboardPreviewSection from '@/components/landing/DashboardPreviewSection'
import FamilyBenefitsSection from '@/components/landing/FamilyBenefitsSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: {
    absolute: 'FitNest — Family Health & Fitness Tracker',
  },
  description:
    'FitNest helps families track workouts, monitor health progress, and build healthy habits together. Shared goals, real accountability — for the whole family.',
  openGraph: {
    title: 'FitNest — Family Health & Fitness Tracker',
    description:
      'FitNest helps families track workouts, monitor health progress, and build healthy habits together. Shared goals, real accountability — for the whole family.',
    url: '/',
    type: 'website',
  },
  twitter: {
    title: 'FitNest — Family Health & Fitness Tracker',
    description:
      'FitNest helps families track workouts, monitor health progress, and build healthy habits together.',
  },
  alternates: { canonical: '/' },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FitNest',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  description:
    'Family health and fitness tracking platform. Track workouts, monitor progress, and build healthy habits together.',
  url: SITE_URL,
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Family', price: '9.99', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro', price: '19.99', priceCurrency: 'USD' },
  ],
  featureList: [
    'Family workout tracking',
    'Health progress monitoring',
    'Shared fitness goals',
    'Family leaderboard',
    'Activity feed',
    'Workout plan builder',
    'Consistency calendar',
    'Family accountability',
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the family system work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'One account holds your entire family. The account owner creates the family and invites members via email or a shareable link. Each member gets their own profile, workout history, and stats — all visible on the shared family dashboard.',
      },
    },
    {
      '@type': 'Question',
      name: "Can I track my kids' workouts?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Parent accounts can log workouts on behalf of younger children, and kids with their own profile can log independently. You can also set age-appropriate workout goals for each member individually.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a limit on how many family members I can add?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Free plan supports 2 members, the Family plan supports up to 10, and the Pro plan has no limit. You can change plans at any time as your family grows.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of workouts does FitNest support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FitNest supports 50+ workout types including running, strength training, yoga, cycling, swimming, HIIT, stretching, and more. You can also create fully custom workouts using the workout builder.',
      },
    },
    {
      '@type': 'Question',
      name: "Is my family's data private?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Completely. FitNest is a private family space — there is no public social feed. Your family's data is only visible to members of your family group. We are GDPR and CCPA compliant and never sell your data.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. There are no contracts or commitments. Cancel from your account settings at any time. If you cancel a paid plan, you keep access until the end of your billing period and then drop to the Free plan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer a free trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every paid plan comes with a 14-day free trial, no credit card required. You can also start on the Free plan and upgrade whenever you\'re ready.',
      },
    },
  ],
}

export default async function Home() {
  const session = await getSession()

  let avatar: string | null = null
  if (session) {
    try {
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { avatar: true },
      })
      avatar = user?.avatar ?? null
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-background min-h-screen w-full overflow-x-hidden">
      <Navbar session={session ? { name: session.name, email: session.email, avatar } : null} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DashboardPreviewSection />
        <FamilyBenefitsSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  )
}
