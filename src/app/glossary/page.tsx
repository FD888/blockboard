import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Глоссарий",
  description: "Глоссарий блокчейн-терминов — BlockBoard",
};

export default function GlossaryPage() {
  return (
    <div className="container-app py-24 md:py-32">
      <h1 className="text-fluid-3xl font-bold mb-4">Глоссарий</h1>
      <p className="text-slate-400">
        Словарь терминов будет доступен в ближайшее время.
      </p>
    </div>
  );
}
