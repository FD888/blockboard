"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const lectures = [
  { id: 1, title: "Введение в блокчейн", hash: "a1b2c3d4" },
  { id: 2, title: "Криптография", hash: "e5f6a7b8" },
  { id: 3, title: "Механизмы консенсуса", hash: "c9d0e1f2" },
  { id: 4, title: "Смарт-контракты", hash: "3a4b5c6d" },
  { id: 5, title: "DeFi", hash: "7e8f9a0b" },
  { id: 6, title: "NFT и токенизация", hash: "1c2d3e4f" },
  { id: 7, title: "Регулирование", hash: "5a6b7c8d" },
];

function ChainLink({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex justify-center py-1">
        <svg
          width="2"
          height="24"
          viewBox="0 0 2 24"
          className="text-secondary/30"
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="24"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-shrink-0 px-1">
      <svg
        width="32"
        height="2"
        viewBox="0 0 32 2"
        className="text-secondary/30"
      >
        <line
          x1="0"
          y1="1"
          x2="32"
          y2="1"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}

const blockVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

export function LectureChain() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="relative z-10 py-24 sm:py-32">
      <div className="container-app">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs text-spbgu-gray-dark mb-3 tracking-widest uppercase">
            Blockchain of knowledge
          </p>
          <h2 className="text-fluid-2xl font-bold text-slate-100">
            Цепочка лекций
          </h2>
        </motion.div>

        {/* Desktop: horizontal scrollable chain */}
        <div
          ref={ref}
          className="hidden md:flex items-center overflow-x-auto no-scrollbar pb-4"
        >
          {lectures.map((lecture, i) => (
            <div key={lecture.id} className="contents">
              <motion.div
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={blockVariants}
              >
                <Link
                  href="/lectures"
                  className="glass-card p-4 w-44 flex-shrink-0 group hover:-translate-y-1 hover:shadow-glow transition-all duration-300 block"
                >
                  {/* Block number */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-primary font-medium">
                      Block #{lecture.id}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-slate-200 mb-2 leading-snug">
                    {lecture.title}
                  </h3>

                  {/* Hash */}
                  <p className="font-mono text-xs text-spbgu-gray-dark truncate">
                    0x{lecture.hash}...
                  </p>
                </Link>
              </motion.div>

              {i < lectures.length - 1 && <ChainLink />}
            </div>
          ))}
        </div>

        {/* Mobile: vertical chain */}
        <div className="md:hidden flex flex-col items-center">
          {lectures.map((lecture, i) => (
            <div key={lecture.id}>
              <motion.div
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={blockVariants}
              >
                <Link
                  href="/lectures"
                  className="glass-card p-4 w-full max-w-sm group hover:shadow-glow transition-all duration-300 block"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary font-medium w-16 shrink-0">
                      Block #{lecture.id}
                    </span>
                    <span className="text-sm font-medium text-slate-200 flex-1">
                      {lecture.title}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                  </div>
                  <p className="font-mono text-xs text-spbgu-gray-dark mt-1 ml-[76px]">
                    0x{lecture.hash}...
                  </p>
                </Link>
              </motion.div>

              {i < lectures.length - 1 && <ChainLink vertical />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
