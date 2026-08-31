import LandingNavbar from '../../components/layout/LandingNavbar'
import HeroSection from './HeroSection'
import ProblemSection from './ProblemSection'
import HowItWorksSection from './HowItWorksSection'
import DemoSection from './DemoSection'
import FeaturesSection from './FeaturesSection'
import CTASection from './CTASection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white selection:bg-hm-teal/30 selection:text-white relative">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <DemoSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </div>
  )
}
