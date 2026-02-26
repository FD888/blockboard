import type { Metadata } from "next";
import Link from "next/link";
import { getLectureMetas } from "@/lib/lectures";

export const metadata: Metadata = {
  title: "Лекции",
  description: "Каталог лекций по блокчейну — BlockBoard",
};

export default function LecturesPage() {
  const metas = getLectureMetas();

  // Placeholder for lecture 1 (not yet available)
  const lecture1 = {
    slug: "1",
    number: 1,
    title: "Введение в блокчейн",
    available: false,
  };

  const lectures = [
    lecture1,
    ...metas.map((m) => ({ ...m, available: true })),
  ];

  return (
    <div className="container-app py-24 md:py-32">
      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-xs text-spbgu-gray-dark mb-3 tracking-widest uppercase">
          Blockchain of knowledge
        </p>
        <h1 className="text-fluid-3xl font-bold text-slate-100 mb-3">
          Лекции
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Конспекты лекций курса «Цифровые технологии и финансовые рынки».
          Каждая лекция доступна в трёх форматах: краткий обзор, расширенный
          конспект и полный материал.
        </p>
      </div>

      {/* Lecture grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {lectures.map((lecture) =>
          lecture.available ? (
            <Link
              key={lecture.number}
              href={`/lectures/${lecture.slug}`}
              className="glass-card p-6 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300 block"
            >
              <LectureCard number={lecture.number} title={lecture.title} available />
            </Link>
          ) : (
            <div
              key={lecture.number}
              className="glass-card p-6 opacity-50 cursor-not-allowed"
            >
              <LectureCard number={lecture.number} title={lecture.title} available={false} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function LectureCard({
  number,
  title,
  available,
}: {
  number: number;
  title: string;
  available: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-primary font-medium">
          Лекция {number}
        </span>
        {available ? (
          <span className="w-2 h-2 rounded-full bg-secondary" />
        ) : (
          <span className="text-xs font-mono text-spbgu-gray-dark border border-spbgu-gray-dark/30 rounded-full px-2 py-0.5">
            Скоро
          </span>
        )}
      </div>
      <h2 className="text-base font-semibold text-slate-200 leading-snug mb-2">
        {title}
      </h2>
      {available && (
        <p className="font-mono text-xs text-spbgu-gray-dark flex items-center gap-1 group-hover:text-secondary transition-colors">
          <span>⚡ 30 сек</span>
          <span className="mx-1 opacity-40">·</span>
          <span>📖 10 мин</span>
          <span className="mx-1 opacity-40">·</span>
          <span>📚 Полный</span>
        </p>
      )}
    </>
  );
}
