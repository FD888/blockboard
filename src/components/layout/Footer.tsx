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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
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

          {/* University */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Университет
            </h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Санкт-Петербургский государственный университет</p>
              <p>
                Дисциплина: «Технология блокчейн
                <br />в экономике и финансах»
              </p>
              <a
                href="https://spbu.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-secondary hover:text-secondary-muted transition-colors duration-200"
              >
                spbu.ru
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm7.25-.75a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-1.94l-4.72 4.72a.75.75 0 01-1.06-1.06l4.72-4.72H12.5a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-500">
            &copy; 2025 BlockBoard. Создано в рамках учебного проекта СПбГУ.
          </p>
          <p className="text-xs text-slate-500">
            Blockchain + Blackboard ={" "}
            <span className="text-primary font-medium">BlockBoard</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
