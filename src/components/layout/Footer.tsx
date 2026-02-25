import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Главная" },
  { href: "/lectures", label: "Лекции" },
  { href: "/glossary", label: "Глоссарий" },
  { href: "/about", label: "О курсе" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50" role="contentinfo">
      <div className="container-app py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 bg-primary rounded-md rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                <div className="absolute inset-0 bg-surface border border-primary/50 rounded-md flex items-center justify-center">
                  <span className="text-primary font-mono font-bold text-xs">
                    B
                  </span>
                </div>
              </div>
              <span className="text-base font-bold tracking-tight">
                <span className="text-primary">Block</span>
                <span className="text-slate-100">Board</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              Транскрибированные и суммаризированные лекции по дисциплине
              «Технология блокчейн в экономике и финансах»
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Навигация
            </h3>
            <ul className="space-y-2" role="list">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-secondary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              О курсе
            </h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>
                Дисциплина: «Технология блокчейн
                <br />в экономике и финансах»
              </p>
              <p>Транскрипции лекций с AI-суммаризацией</p>
            </div>
          </div>

          {/* SPbGU */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Университет
            </h3>
            <div className="space-y-3">
              <a
                href="https://spbu.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 group"
              >
                {/* Shield icon */}
                <svg
                  width="28"
                  height="32"
                  viewBox="0 0 28 32"
                  fill="none"
                  className="text-primary flex-shrink-0 mt-0.5 group-hover:text-primary-light transition-colors"
                >
                  <path
                    d="M14 1L26 6V14C26 21.5 20.5 27.5 14 29.5C7.5 27.5 2 21.5 2 14V6L14 1Z"
                    fill="currentColor"
                    fillOpacity="0.15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <text x="14" y="20" textAnchor="middle" fontSize="9" fill="currentColor" fontWeight="bold" fontFamily="serif">СПб</text>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors leading-tight">
                    СПбГУ
                  </p>
                  <p className="text-xs text-slate-500 leading-tight">
                    Санкт-Петербургский
                    <br />государственный университет
                  </p>
                </div>
              </a>
              <p className="text-xs text-slate-500">
                Экономический факультет
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-500">
            &copy; 2025 BlockBoard · Студенческий проект{" "}
            <a
              href="https://spbu.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 hover:text-primary transition-colors"
            >
              СПбГУ
            </a>
          </p>
          <p className="font-mono text-xs text-slate-600">
            0x426c6f636b426f617264
          </p>
        </div>
      </div>
    </footer>
  );
}
