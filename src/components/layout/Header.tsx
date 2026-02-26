"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/lectures", label: "Лекции" },
  { href: "/glossary", label: "Глоссарий" },
  { href: "/about", label: "О курсе" },
  { href: "/bot", label: "КОМБАТ" },
] as const;

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container-app">
        <nav
          className="flex items-center justify-between h-16 md:h-20"
          aria-label="Основная навигация"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="BlockBoard — На главную"
          >
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <div className="absolute inset-0 bg-primary rounded-lg rotate-3 group-hover:rotate-6 transition-transform duration-300" />
              <div className="absolute inset-0 bg-surface border border-primary/50 rounded-lg flex items-center justify-center">
                <span className="text-primary font-mono font-bold text-sm md:text-base">
                  B
                </span>
              </div>
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight">
              <span className="text-primary">Block</span>
              <span className="text-slate-100">Board</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    link.href === "/bot"
                      ? isActive(link.href)
                        ? "text-yellow-300 bg-yellow-500/20 border border-yellow-500/30"
                        : "text-yellow-400/80 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/20"
                      : isActive(link.href)
                        ? "text-primary bg-primary/10"
                        : "text-slate-300 hover:text-slate-100 hover:bg-surface-light"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-light transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-slate-100 transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-slate-100 transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-slate-100 transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню навигации"
      >
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <nav className="relative z-10 container-app pt-8">
          <ul className="flex flex-col gap-2" role="list">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                className={`transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMobileMenuOpen
                    ? `${index * 75}ms`
                    : "0ms",
                }}
              >
                <Link
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors duration-200 ${
                    link.href === "/bot"
                      ? isActive(link.href)
                        ? "text-yellow-300 bg-yellow-500/20 border border-yellow-500/30"
                        : "text-yellow-400/80 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/20"
                      : isActive(link.href)
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-slate-300 hover:text-slate-100 hover:bg-surface-light"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
