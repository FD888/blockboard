"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { TextDecode } from "./TextDecode";

export interface LectureEntry {
  number: number;
  title: string;
  available: boolean;
}

interface Props {
  lectures: LectureEntry[];
}

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

function BlockCard({ lecture, index, isInView }: { lecture: LectureEntry; index: number; isInView: boolean }) {
  const inner = (
    <motion.div
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={blockVariants}
    >
      <div
        className={`glass-card p-4 w-52 flex-shrink-0 transition-all duration-300 block ${
          lecture.available
            ? "group hover:-translate-y-1 hover:shadow-glow cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        {/* Block number */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-primary font-medium">
            Block #{lecture.number}
          </span>
          {lecture.available ? (
            <span className="w-2 h-2 rounded-full bg-secondary" />
          ) : (
            <span className="text-xs font-mono text-spbgu-gray-dark">скоро</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-slate-200 mb-2 leading-snug line-clamp-3">
          {lecture.title}
        </h3>

        {/* Hash-style id */}
        <p className="font-mono text-xs text-spbgu-gray-dark truncate">
          0x{(lecture.number * 0xa1b2c3).toString(16).padStart(8, "0").slice(0, 8)}...
        </p>
      </div>
    </motion.div>
  );

  if (lecture.available) {
    return (
      <Link href={`/lectures/${lecture.number}`} className="contents">
        {inner}
      </Link>
    );
  }
  return inner;
}

function BlockCardMobile({ lecture, index }: { lecture: LectureEntry; index: number }) {
  const inner = (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={blockVariants}
    >
      <div
        className={`glass-card p-4 w-full max-w-sm transition-all duration-300 ${
          lecture.available
            ? "group hover:shadow-glow"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-primary font-medium w-20 shrink-0">
            Block #{lecture.number}
          </span>
          <span className="text-sm font-medium text-slate-200 flex-1 line-clamp-2">
            {lecture.title}
          </span>
          {lecture.available ? (
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
          ) : (
            <span className="text-xs font-mono text-spbgu-gray-dark shrink-0">скоро</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (lecture.available) {
    return (
      <Link href={`/lectures/${lecture.number}`} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function LectureChain({ lectures }: Props) {
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
            <TextDecode
              text="Цепочка лекций"
              scrollTriggered
              speed={30}
            />
          </h2>
        </motion.div>

        {/* Desktop: horizontal scrollable chain */}
        <div
          ref={ref}
          className="hidden md:flex items-center overflow-x-auto no-scrollbar pb-4"
        >
          {lectures.map((lecture, i) => (
            <div key={lecture.number} className="contents">
              <BlockCard lecture={lecture} index={i} isInView={isInView} />
              {i < lectures.length - 1 && <ChainLink />}
            </div>
          ))}
        </div>

        {/* Mobile: vertical chain */}
        <div className="md:hidden flex flex-col items-center">
          {lectures.map((lecture, i) => (
            <div key={lecture.number}>
              <BlockCardMobile lecture={lecture} index={i} />
              {i < lectures.length - 1 && <ChainLink vertical />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
