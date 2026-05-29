import { getSession } from '@/lib/auth'
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

export default async function Home() {
  const session = await getSession()

  return (
    <div className="bg-[#0F1115] min-h-screen w-full overflow-x-hidden">
      <Navbar session={session ? { name: session.name, email: session.email } : null} />
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
    </div>
  )
}
