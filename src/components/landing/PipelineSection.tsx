"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-8 h-8"
      >
        {/* Microphone / audio wave */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 10v2a7 7 0 0 1-14 0v-2"
        />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: "Лекция",
    description: "Аудио записано на паре",
    mono: "input: audio_stream",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-8 h-8"
      >
        {/* Document / text processing */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
        />
        <polyline
          points="14 2 14 8 20 8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
    title: "Транскрипция",
    description: "AI расшифровывает речь",
    mono: "process: llm.transcribe()",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-8 h-8"
      >
        {/* Block / cube */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        />
        <polyline
          points="3.27 6.96 12 12.01 20.73 6.96"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: "Блок",
    description: "Знание сохранено навсегда",
    mono: "output: block.commit()",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

function ConnectorLine({ index }: { index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className="hidden md:flex items-center justify-center flex-shrink-0"
    >
      <svg width="80" height="24" viewBox="0 0 80 24" className="text-secondary/30">
        <motion.line
          x1="0"
          y1="12"
          x2="60"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="60"
          initial={{ strokeDashoffset: 60 }}
          animate={isInView ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
        />
        {/* Arrow head */}
        <motion.polygon
          points="60,6 80,12 60,18"
          fill="currentColor"
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3, delay: index * 0.2 + 0.9 }}
        />
      </svg>
    </div>
  );
}

export function PipelineSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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
            How it works
          </p>
          <h2 className="text-fluid-2xl font-bold text-slate-100">
            От лекции до блока за 3 шага
          </h2>
        </motion.div>

        {/* Pipeline */}
        <div
          ref={ref}
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0"
        >
          {steps.map((step, i) => (
            <div key={step.title} className="contents">
              <motion.div
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={cardVariants}
                className="glass-card p-6 w-full max-w-xs text-center group hover:shadow-glow transition-shadow duration-300"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 text-secondary mb-4 group-hover:bg-secondary/20 transition-colors duration-300">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-slate-100 mb-1">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-3">
                  {step.description}
                </p>

                {/* Mono code hint */}
                <p className="font-mono text-xs text-spbgu-gray-dark">
                  {step.mono}
                </p>
              </motion.div>

              {/* Connector arrow (between cards, not after last) */}
              {i < steps.length - 1 && <ConnectorLine index={i} />}

              {/* Mobile connector (vertical) */}
              {i < steps.length - 1 && (
                <div className="md:hidden flex justify-center">
                  <svg
                    width="24"
                    height="40"
                    viewBox="0 0 24 40"
                    className="text-secondary/30"
                  >
                    <line
                      x1="12"
                      y1="0"
                      x2="12"
                      y2="28"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <polygon points="6,28 12,40 18,28" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
