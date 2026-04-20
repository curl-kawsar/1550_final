import FAQSection from "@/components/district/FAQSection";
import Hero from "@/components/district/Hero";
import HowItWorksSection from "@/components/district/HowItWorksSection";
import NextStepsSection from "@/components/district/NextStepsSection";
import ProgramOverviewSection from "@/components/district/ProgramOverviewSection";
import ResultsSection from "@/components/district/ResultsSection";
import SelectionCriteriaSection from "@/components/district/SelectionCriteriaSection";
import ZeroRiskSection from "@/components/district/ZeroRiskSection";

export default function DistrictPage() {
  return (
    <main className="min-h-">
      <Hero />
      <ProgramOverviewSection />
      <ResultsSection />
      <HowItWorksSection />
      <SelectionCriteriaSection />
      <ZeroRiskSection />
      <FAQSection />
      <NextStepsSection />
    </main>
  );
}
