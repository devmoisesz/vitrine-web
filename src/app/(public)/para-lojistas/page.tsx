import { Header } from "@/components/layout/header";
import { LandingBenefits } from "@/components/landing/landing-benefits";
import { LandingContactCta } from "@/components/landing/landing-contact-cta";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingProblemSection } from "@/components/landing/landing-problem-section";

export default function ParaLojistasPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <LandingHero />
        <LandingProblemSection />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingContactCta />
      </main>
    </div>
  );
}
