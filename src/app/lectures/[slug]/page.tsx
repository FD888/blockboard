import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLectureMetas, getLectureBySlug } from "@/lib/lectures";
import { LectureViewer } from "@/components/lectures/LectureViewer";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getLectureMetas().map((l) => ({ slug: String(l.number) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lecture = getLectureBySlug(params.slug);
  if (!lecture) return { title: "Лекция не найдена" };
  return {
    title: `Лекция ${lecture.number}: ${lecture.title}`,
    description: `Конспект лекции ${lecture.number} — ${lecture.title}`,
  };
}

export default function LecturePage({ params }: Props) {
  const lecture = getLectureBySlug(params.slug);
  if (!lecture) notFound();

  return (
    <div className="container-app py-24 md:py-32">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-10">
        <Link href="/" className="hover:text-slate-200 transition-colors">
          Главная
        </Link>
        <span className="text-border">›</span>
        <Link href="/lectures" className="hover:text-slate-200 transition-colors">
          Лекции
        </Link>
        <span className="text-border">›</span>
        <span className="text-slate-300">Лекция {lecture.number}</span>
      </nav>

      <LectureViewer
        title={lecture.title}
        number={lecture.number}
        short={lecture.short}
        medium={lecture.medium}
        full={lecture.full}
        terms={lecture.terms}
        conclusion={lecture.conclusion}
      />

      {/* Navigation between lectures */}
      <div className="mt-12 flex justify-between">
        <Link
          href="/lectures"
          className="glass-card px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:shadow-glow transition-all duration-200"
        >
          ← Все лекции
        </Link>
      </div>
    </div>
  );
}
