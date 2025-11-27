import { HeroSection } from "@/components/hero-section"
import { ComparisonSection } from "@/components/comparison-section"
import { KinematicsSimulator } from "@/components/kinematics-simulator"
import { PalletizingDemo } from "@/components/palletizing-demo"
import { ElectronicsSection } from "@/components/electronics-section"
import { CodeSection } from "@/components/code-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background blueprint-grid">
      <HeroSection />
      <ComparisonSection />
      <KinematicsSimulator />
      <PalletizingDemo />
      <ElectronicsSection />
      <CodeSection />
      <Footer />
    </main>
  )
}
