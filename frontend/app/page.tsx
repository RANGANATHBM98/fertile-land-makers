import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedLands } from "@/components/landing/featured-lands"
import { SmartFarming } from "@/components/landing/smart-farming"
import { WaterInsights } from "@/components/landing/water-insights"
import { CropRecommendations } from "@/components/landing/crop-recommendations"
import { Testimonials } from "@/components/landing/testimonials"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedLands />
      <SmartFarming />
      <WaterInsights />
      <CropRecommendations />
      <Testimonials />
      <Footer />
    </main>
  )
}
