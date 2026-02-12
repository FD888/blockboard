"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

function AnimatedCounter({
  end,
  prefix = "",
  suffix = "",
  duration = 2000,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 7,
    label: "лекций замайнено",
    prefix: "",
    suffix: "",
  },
  {
    value: 100,
    label: "терминов в глоссарии",
    prefix: "~",
    suffix: "",
  },
  {
    value: null, // infinity symbol, special case
    label: "часов сэкономлено",
    prefix: "",
    suffix: "",
  },
];

export function StatsSection() {
  return (
    <section className="relative z-10 py-24 sm:py-32">
      <div className="container-app">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 max-w-3xl mx-auto mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
              }}
              className="text-center"
            >
              <div className="text-fluid-3xl font-bold font-mono text-slate-100 mb-2">
                {stat.value !== null ? (
                  <AnimatedCounter
                    end={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                ) : (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      delay: i * 0.15 + 0.3,
                    }}
                    className="inline-block text-secondary"
                  >
                    &infin;
                  </motion.span>
                )}
              </div>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-xs text-spbgu-gray-dark">
            Последний блок: 2 мин назад{" "}
            <span className="text-spbgu-gray-dark/50 mx-1">&middot;</span>{" "}
            Сеть стабильна{" "}
            <span className="text-spbgu-gray-dark/50 mx-1">&middot;</span>{" "}
            <span className="text-secondary/50">42 ноды онлайн</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
