"use client";

import { useState, useMemo } from "react";

interface GlossaryEntry {
  term: string;
  definition: string;
  lecture: number;
}

interface Props {
  entries: GlossaryEntry[];
}

const LECTURE_COLORS: Record<number, string> = {
  2: "text-primary border-primary/30 bg-primary/10",
  3: "text-secondary border-secondary/30 bg-secondary/10",
  4: "text-slate-300 border-slate-600/30 bg-slate-700/10",
};

export function GlossaryClient({ entries }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q)
    );
  }, [query, entries]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-spbgu-gray-dark pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по термину или определению..."
          className="w-full glass-card pl-11 pr-4 py-3 text-slate-200 placeholder-spbgu-gray-dark bg-transparent outline-none focus:border-secondary/50 transition-colors rounded-xl"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-spbgu-gray-dark hover:text-slate-300 transition-colors"
            aria-label="Очистить поиск"
          >
            ×
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500 mb-4">
        {filtered.length === entries.length
          ? `${entries.length} терминов`
          : `${filtered.length} из ${entries.length} терминов`}
      </p>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">
          Ничего не найдено по запросу «{query}»
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((entry) => (
            <div key={entry.term} className="glass-card p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h3 className="font-semibold text-slate-100 text-base leading-snug">
                  {entry.term}
                </h3>
                <span
                  className={`shrink-0 text-xs font-mono px-2 py-0.5 rounded-full border ${
                    LECTURE_COLORS[entry.lecture] ?? "text-slate-400 border-slate-600/30 bg-slate-700/10"
                  }`}
                >
                  Л{entry.lecture}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {entry.definition}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
