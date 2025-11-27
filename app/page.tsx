import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { ObjectivesSection } from "@/components/objectives-section"
import { JustificationSection } from "@/components/justification-section"
import { ComparisonSection } from "@/components/comparison-section"
import { MechanicalSection } from "@/components/mechanical-section"
import { GearsSimulator } from "@/components/gears-simulator"
import { KinematicsSimulator } from "@/components/kinematics-simulator"
import { PalletizingDemo } from "@/components/palletizing-demo"
import { ElectronicsSection } from "@/components/electronics-section"
import { CodeSection } from "@/components/code-section"
import { ConclusionsSection } from "@/components/conclusions-section"
import { TeamSection } from "@/components/team-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background blueprint-grid">
      <HeroSection />
      <ProblemSection />
      <ObjectivesSection />
      <JustificationSection />
      <ComparisonSection />
      <MechanicalSection />
      <GearsSimulator />
      <KinematicsSimulator />
      <PalletizingDemo />
      <ElectronicsSection />
      <CodeSection />
      <ConclusionsSection />
      <TeamSection />
      <Footer />
    </main>
  )
}
