import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Лекции",
  description: "Каталог лекций по блокчейну — BlockBoard",
};

export default function LecturesPage() {
  return (
    <div className="container-app py-24 md:py-32">
      <h1 className="text-fluid-3xl font-bold mb-4">Лекции</h1>
      <p className="text-slate-400">
        Каталог лекций будет доступен в ближайшее время.
      </p>
    </div>
  );
}
