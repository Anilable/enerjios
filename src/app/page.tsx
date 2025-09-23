import { HeroSection } from '@/components/sections/hero-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { CalculatorSection } from '@/components/sections/calculator-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { TrustSection } from '@/components/sections/trust-section'
import { CompaniesSection } from '@/components/sections/companies-section'
import { PublicLayout } from '@/components/layout/dashboard-layout'
import { ChatBot } from '@/components/chatbot/ChatBot'

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
      <CalculatorSection />
      <TestimonialsSection />
      <TrustSection />
      <CompaniesSection />
      <ChatBot />
    </PublicLayout>
  )
}
