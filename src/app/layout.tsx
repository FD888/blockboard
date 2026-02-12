import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BlockBoard — Лекции по блокчейну",
    template: "%s | BlockBoard",
  },
  description:
    "Транскрибированные и суммаризированные лекции по дисциплине «Технология блокчейн в экономике и финансах».",
  keywords: [
    "блокчейн",
    "лекции",
    "криптовалюта",
    "экономика",
    "финансы",
    "транскрипция",
  ],
  authors: [{ name: "BlockBoard" }],
  openGraph: {
    title: "BlockBoard — Лекции по блокчейну",
    description:
      "Транскрибированные и суммаризированные лекции по блокчейну.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
