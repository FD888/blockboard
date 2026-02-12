import { HeroSection } from "@/components/landing/HeroSection";
import { PipelineSection } from "@/components/landing/PipelineSection";
import { LectureChain } from "@/components/landing/LectureChain";
import { StatsSection } from "@/components/landing/StatsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PipelineSection />
      <LectureChain />
      <StatsSection />
    </>
  );
}
