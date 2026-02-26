"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface Props {
  title: string;
  number: number;
  short: string;
  medium: string;
  full: string;
  terms: string;
  conclusion: string;
}

type Mode = "short" | "medium" | "full";

const mdComponents: Components = {
  h3: ({ children }) => (
    <h3 className="text-fluid-lg font-bold text-slate-100 mt-6 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-fluid-base font-semibold text-secondary mt-4 mb-1">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-slate-300 leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-3 text-slate-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-slate-300 leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="text-slate-100 font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-secondary italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-secondary/50 pl-4 my-3 text-slate-400 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border my-4" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-light">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left text-slate-200 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 text-slate-300 align-top">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-surface/50">{children}</tr>
  ),
  code: ({ children }) => (
    <code className="font-mono text-secondary bg-surface-light px-1 rounded text-sm">
      {children}
    </code>
  ),
};

const MODES: { key: Mode; label: string; icon: string }[] = [
  { key: "short", label: "30 сек", icon: "⚡" },
  { key: "medium", label: "10 минут", icon: "📖" },
  { key: "full", label: "Полный", icon: "📚" },
];

export function LectureViewer({
  title,
  number,
  short,
  medium,
  full,
  terms,
  conclusion,
}: Props) {
  const [mode, setMode] = useState<Mode>("medium");

  const contentMap: Record<Mode, string> = { short, medium, full };
  const activeContent = contentMap[mode];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-spbgu-gray-dark mb-2 tracking-widest uppercase">
          Лекция {number}
        </p>
        <h1 className="text-fluid-2xl font-bold text-slate-100">{title}</h1>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6 p-1 glass-card w-fit">
        {MODES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              mode === key
                ? "bg-primary text-white shadow-glow-red"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface-light"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="glass-card p-6 md:p-8 mb-6">
        {activeContent ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {activeContent}
          </ReactMarkdown>
        ) : (
          <p className="text-slate-400">Раздел недоступен.</p>
        )}
      </div>

      {/* Terms — always visible */}
      {terms && (
        <div className="glass-card p-6 md:p-8 mb-6">
          <h2 className="text-fluid-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span>🔑</span>
            <span>Ключевые термины</span>
          </h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {terms}
          </ReactMarkdown>
        </div>
      )}

      {/* Conclusion — always visible */}
      {conclusion && (
        <div className="glass-card p-6 md:p-8 border-l-2 border-secondary/40">
          <h2 className="text-fluid-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>Итог</span>
          </h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {conclusion}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
