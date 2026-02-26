"use client";

const LECTURES = [
  { number: 2, title: "Технология блокчейн" },
  { number: 3, title: "Майнинг и консенсус" },
  { number: 4, title: "Смарт-контракты и DeFi" },
];

interface Props {
  onSelectLecture: (lectureNumber: number, lectureTitle: string) => void;
}

function hasTokenForLecture(lectureNumber: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("hk_wallet");
    if (!raw) return false;
    const wallet: { coin: string }[] = JSON.parse(raw);
    return wallet.some((c) =>
      /^HK1:[0-9a-f]+:quiz-L(\d+)-\d+:[0-9a-f]+$/.test(c.coin) &&
      new RegExp(`^HK1:[0-9a-f]+:quiz-L${lectureNumber}-\\d+:[0-9a-f]+$`).test(c.coin)
    );
  } catch {
    return false;
  }
}

export function LectureQuizPicker({ onSelectLecture }: Props) {
  return (
    <div className="glass-card p-4 mt-2">
      <p className="text-sm text-slate-300 mb-3 font-medium">
        Выбери лекцию для квиза:
      </p>
      <div className="flex flex-col gap-2">
        {LECTURES.map((lec) => {
          const alreadyPassed = hasTokenForLecture(lec.number);
          return (
            <button
              key={lec.number}
              onClick={() => !alreadyPassed && onSelectLecture(lec.number, lec.title)}
              disabled={alreadyPassed}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 ${
                alreadyPassed
                  ? "border-secondary/30 bg-secondary/5 text-secondary/60 cursor-default"
                  : "border-border/50 bg-surface/30 text-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-slate-100 cursor-pointer"
              }`}
            >
              <span>
                <span className="font-mono text-xs text-primary mr-2">Л{lec.number}</span>
                {lec.title}
              </span>
              {alreadyPassed ? (
                <span className="text-xs font-mono text-secondary">✓ сдано</span>
              ) : (
                <span className="text-xs text-slate-500">7 вопросов</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Нужно 6 из 7 правильных ответов для получения токена.
      </p>
    </div>
  );
}
