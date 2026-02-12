"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GenesisBlockProps {
  delay?: number;
}

export function GenesisBlock({ delay = 0 }: GenesisBlockProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const rows = [
    { label: "Block", value: "#0 \u2014 Genesis" },
    { label: "Hash", value: "0x426c6f636b426f617264" },
    { label: "Prev", value: "0x0000000000000000" },
    { label: "Data", value: '\u00AB\u0422\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u044f \u0431\u043b\u043e\u043a\u0447\u0435\u0439\u043d...\u00BB' },
    { label: "Nonce", value: "42069" },
    { label: "Status", value: "\u2713 Confirmed", isStatus: true },
  ];

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay,
        }}
        style={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass-card p-5 sm:p-6 max-w-md w-full animate-float shadow-glow animate-glow-pulse transition-transform duration-150 ease-out cursor-default"
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
          <span className="ml-auto font-mono text-xs text-spbgu-gray-dark">
            block_explorer.exe
          </span>
        </div>

        {/* Block data */}
        <div className="space-y-2 font-mono text-xs sm:text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-3">
              <span className="text-spbgu-gray-dark w-14 shrink-0 text-right">
                {row.label}:
              </span>
              <span
                className={
                  row.isStatus
                    ? "text-secondary font-medium"
                    : "text-slate-300 truncate"
                }
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Subtle "verified" badge */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-spbgu-gray-dark font-mono">
            timestamp: {new Date().toISOString().split("T")[0]}
          </span>
          <span className="text-xs text-secondary/70 font-mono">
            1 confirmation
          </span>
        </div>
      </motion.div>
    </div>
  );
}
