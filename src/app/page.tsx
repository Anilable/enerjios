import { HeroSection } from '@/components/sections/hero-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { CalculatorSection } from '@/components/sections/calculator-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { TrustSection } from '@/components/sections/trust-section'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CalculatorSection />
      <TestimonialsSection />
      <TrustSection />
    </main>
  )
}
