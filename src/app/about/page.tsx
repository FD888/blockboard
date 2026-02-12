import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О курсе",
  description:
    "О дисциплине «Технология блокчейн в экономике и финансах» — BlockBoard",
};

export default function AboutPage() {
  return (
    <div className="container-app py-24 md:py-32">
      <h1 className="text-fluid-3xl font-bold mb-4">О курсе</h1>
      <p className="text-slate-400">
        Информация о курсе будет доступна в ближайшее время.
      </p>
    </div>
  );
}
