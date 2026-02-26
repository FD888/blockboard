import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { GlossaryClient } from "@/components/glossary/GlossaryClient";

export const metadata: Metadata = {
  title: "Глоссарий",
  description: "Словарь блокчейн-терминов — BlockBoard",
};

interface GlossaryEntry {
  term: string;
  definition: string;
  lecture: number;
}

function loadGlossary(): GlossaryEntry[] {
  const filePath = path.join(process.cwd(), "content", "glossary.json");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GlossaryEntry[];
}

export default function GlossaryPage() {
  const entries = loadGlossary();

  return (
    <div className="container-app py-24 md:py-32">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs text-spbgu-gray-dark mb-3 tracking-widest uppercase">
          Словарь терминов
        </p>
        <h1 className="text-fluid-3xl font-bold text-slate-100 mb-3">
          Глоссарий
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Ключевые термины из лекций курса «Цифровые технологии и финансовые
          рынки». Каждый термин отмечен номером лекции, в которой он впервые
          встречается.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border text-primary border-primary/30 bg-primary/10">
            Л2 — Лекция 2
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border text-secondary border-secondary/30 bg-secondary/10">
            Л3 — Лекция 3
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border text-slate-300 border-slate-600/30 bg-slate-700/10">
            Л4 — Лекция 4
          </span>
        </div>
      </div>

      <GlossaryClient entries={entries} />
    </div>
  );
}
