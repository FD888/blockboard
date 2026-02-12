"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NetworkBackground } from "./NetworkBackground";
import { TextDecode } from "./TextDecode";
import { GenesisBlock } from "./GenesisBlock";

export function HeroSection() {
  const [titleDone, setTitleDone] = useState(false);

  const handleTitleComplete = () => {
    setTitleDone(true);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <NetworkBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container-app flex flex-col items-center text-center py-20"
      >
        {/* Title with decode effect */}
        <h1 className="text-fluid-4xl font-bold leading-tight mb-2">
          <TextDecode
            text="BlockBoard"
            className="text-gradient"
            speed={60}
            delay={300}
            onComplete={handleTitleComplete}
          />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={titleDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-fluid-lg text-slate-300 max-w-2xl mb-3"
        >
          Лекции по блокчейну, которые невозможно потерять
        </motion.p>

        {/* Course name */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={titleDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-fluid-base text-secondary font-medium mb-10"
        >
          Технология блокчейн в экономике и финансах
        </motion.p>

        {/* Genesis Block Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={titleDone ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <GenesisBlock delay={titleDone ? 0 : 999} />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={titleDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/lectures"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-all duration-200 shadow-glow-red hover:shadow-[0_0_30px_rgba(202,6,16,0.3)]"
          >
            Перейти к лекциям
          </Link>
          <Link
            href="/glossary"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-secondary/30 text-secondary hover:bg-secondary/10 font-medium transition-all duration-200"
          >
            Глоссарий терминов
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={titleDone ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-5 h-8 rounded-full border-2 border-secondary/30 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-secondary/50" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
