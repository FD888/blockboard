import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container-app">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center py-20">
        {/* Decorative hash — "BlockBoard" in ASCII hex */}
        <p className="font-mono text-xs text-spbgu-gray-dark mb-6 tracking-widest">
          0x426c6f636b426f617264
        </p>

        <h1 className="text-fluid-4xl font-bold leading-tight mb-6">
          <span className="text-gradient">BlockBoard</span>
        </h1>

        <p className="text-fluid-lg text-slate-300 max-w-2xl mb-4">
          Транскрибированные и суммаризированные лекции по дисциплине
        </p>
        <p className="text-fluid-base text-secondary font-medium mb-8">
          «Технология блокчейн в экономике и финансах»
        </p>
        <p className="text-sm text-spbgu-gray mb-12">
          Санкт-Петербургский государственный университет
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/lectures"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-colors duration-200 shadow-glow-red"
          >
            Перейти к лекциям
          </Link>
          <Link
            href="/glossary"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-secondary/30 text-secondary hover:bg-secondary/10 font-medium transition-colors duration-200"
          >
            Глоссарий терминов
          </Link>
        </div>

        {/* Decorative blockchain */}
        <div className="mt-16 flex items-center gap-3 opacity-30">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-secondary/40 flex items-center justify-center">
                <span className="font-mono text-xs text-secondary">{i}</span>
              </div>
              {i < 5 && <div className="w-6 h-px bg-secondary/40" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
