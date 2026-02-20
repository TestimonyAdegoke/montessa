import AnimatedHero from "@/components/landing/animated-hero"
import FeaturesSection from "@/components/landing/features-section"
import HowItWorks from "@/components/landing/how-it-works"
import TestimonialsSection from "@/components/landing/testimonials-section"
import PricingSection from "@/components/landing/pricing-section"
import FAQSection from "@/components/landing/faq-section"
import CTASection from "@/components/landing/cta-section"
import LandingHeader from "@/components/landing/landing-header"
import LandingFooter from "@/components/landing/landing-footer"
import FloatingChat from "@/components/landing/floating-chat"

export default function HomePage() {
  return (
    <div className="relative">
      <LandingHeader />
      
      <main>
        <AnimatedHero />
        
        <div id="features">
          <FeaturesSection />
        </div>
        
        <div id="how-it-works">
          <HowItWorks />
        </div>
        
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        
        <div id="pricing">
          <PricingSection />
        </div>
        
        <FAQSection />
        
        <CTASection />
      </main>
      
      <LandingFooter />
      
      <FloatingChat />
    </div>
  )
}
