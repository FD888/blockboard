import { HeroSection } from "@/components/landing/HeroSection";
import { PipelineSection } from "@/components/landing/PipelineSection";
import { TamperProofDemo } from "@/components/landing/TamperProofDemo";
import { LectureChain } from "@/components/landing/LectureChain";
import { MineBlock } from "@/components/landing/MineBlock";
import { HashInput } from "@/components/landing/HashInput";
import { StatsSection } from "@/components/landing/StatsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="section-separator">
        <PipelineSection />
      </div>
      <div className="section-separator">
        <TamperProofDemo />
      </div>
      <div className="section-separator">
        <LectureChain />
      </div>
      <div className="section-separator">
        <MineBlock />
      </div>
      <div className="section-separator">
        <HashInput />
      </div>
      <div className="section-separator">
        <StatsSection />
      </div>
    </>
  );
}
