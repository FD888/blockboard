import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О курсе — BlockBoard · СПбГУ",
  description:
    "Дисциплина «Технология блокчейн в экономике и финансах» Санкт-Петербургского государственного университета. Транскрибированные лекции с AI-суммаризацией.",
};

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "AI-транскрипции",
    description:
      "Каждая лекция записана, транскрибирована и суммаризирована с помощью современных языковых моделей. Ключевые тезисы — в удобном формате.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
    title: "Блокчейн-архив",
    description:
      "Лекции хранятся в виде блокчейн-цепочки — каждый блок содержит хэш предыдущего, делая знания tamper-proof и прозрачными.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    title: "Глоссарий терминов",
    description:
      "Более 100 терминов блокчейн-индустрии с определениями на русском языке. От хэш-функций до DeFi и смарт-контрактов.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    ),
    title: "AI-ассистент КОМБАТ",
    description:
      "Интеллектуальный помощник на основе RAG-архитектуры отвечает на вопросы по материалу лекций, опираясь только на проверенные источники.",
  },
];

const topics = [
  "Основы криптографии и хэш-функций",
  "Архитектура блокчейн-сетей",
  "Proof-of-Work и Proof-of-Stake",
  "Bitcoin и его протокол",
  "Ethereum и смарт-контракты",
  "Децентрализованные финансы (DeFi)",
  "Токены и NFT",
  "Блокчейн в экономике и финансах",
  "Регуляторные аспекты криптоактивов",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="container-app py-24 md:py-32 relative z-10">
          {/* SPbGU badge */}
          <div className="mb-6">
            <a
              href="https://spbu.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold tracking-wide uppercase hover:border-primary/50 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 0.5L11 3V7C11 9.5 8.8 11.5 6 12C3.2 11.5 1 9.5 1 7V3L6 0.5Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="0.8"/>
              </svg>
              Санкт-Петербургский государственный университет
            </a>
          </div>

          <h1 className="text-fluid-3xl font-bold mb-4 text-slate-100">
            О курсе
          </h1>
          <p className="text-fluid-lg text-slate-300 max-w-2xl mb-2">
            «Технология блокчейн в экономике и финансах»
          </p>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Академический курс Санкт-Петербургского государственного университета,
            посвящённый технологии блокчейн, её применению в финансовом секторе
            и экономике. BlockBoard — студенческая платформа для удобного доступа
            к материалам лекций с AI-поддержкой.
          </p>
        </div>
      </div>

      <div className="container-app py-16 md:py-24 space-y-20">
        {/* Features */}
        <section>
          <h2 className="text-fluid-xl font-bold text-slate-100 mb-8">
            Возможности платформы
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card p-6 flex gap-4 hover:shadow-glow transition-shadow duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Topics */}
        <section>
          <h2 className="text-fluid-xl font-bold text-slate-100 mb-8">
            Темы курса
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((topic, i) => (
              <div
                key={topic}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface/50 hover:border-secondary/30 transition-colors"
              >
                <span className="font-mono text-xs text-secondary/60 flex-shrink-0 w-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-slate-300">{topic}</span>
              </div>
            ))}
          </div>
        </section>

        {/* University block */}
        <section>
          <div className="glass-card p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Shield */}
            <div className="flex-shrink-0">
              <svg
                width="64"
                height="72"
                viewBox="0 0 64 72"
                fill="none"
                className="text-primary"
              >
                <path
                  d="M32 2L60 14V32C60 50 47 64 32 68C17 64 4 50 4 32V14L32 2Z"
                  fill="currentColor"
                  fillOpacity="0.1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M32 12L52 22V32C52 46 43 57 32 60C21 57 12 46 12 32V22L32 12Z"
                  fill="currentColor"
                  fillOpacity="0.08"
                />
                <text x="32" y="46" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold" fontFamily="serif">СПб</text>
              </svg>
            </div>

            <div>
              <h2 className="text-fluid-xl font-bold text-slate-100 mb-2">
                Санкт-Петербургский государственный университет
              </h2>
              <p className="text-secondary font-medium mb-4">
                Один из старейших и ведущих университетов России
              </p>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-xl">
                СПбГУ основан в 1724 году по указу Петра I. Экономический факультет
                готовит специалистов мирового уровня в области финансов, экономики
                и цифровых технологий. Курс «Технология блокчейн в экономике и финансах»
                отражает стремление университета к подготовке кадров для цифровой экономики.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://spbu.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
                >
                  Сайт университета
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 11.5L11.5 2.5M11.5 2.5H6M11.5 2.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <Link
                  href="/lectures"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/30 text-secondary hover:bg-secondary/10 text-sm font-medium transition-colors"
                >
                  Перейти к лекциям
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
