import { HeroSection } from "@/components/landing/HeroSection";
import { PipelineSection } from "@/components/landing/PipelineSection";
import { TamperProofDemo } from "@/components/landing/TamperProofDemo";
import { LectureChain } from "@/components/landing/LectureChain";
import { MineBlock } from "@/components/landing/MineBlock";
import { HashInput } from "@/components/landing/HashInput";
import { StatsSection } from "@/components/landing/StatsSection";
import { getLectureMetas } from "@/lib/lectures";

export default function HomePage() {
  const metas = getLectureMetas();

  const lectures = [
    { number: 1, title: "Введение в блокчейн", available: false },
    ...metas.map((m) => ({ number: m.number, title: m.title, available: true })),
  ];

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
        <LectureChain lectures={lectures} />
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
