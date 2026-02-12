"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  "> initializing blockboard protocol...",
  "> connecting to knowledge network... done",
  "> genesis block: 0x426c6f636b426f617264",
  "> status: operational \u2713",
];

const CHAR_SPEED = 18; // ms per character
const LINE_PAUSE = 200; // ms between lines
const END_PAUSE = 600; // ms before fade out

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Check if already shown this session
    if (typeof window !== "undefined") {
      const shown = sessionStorage.getItem("blockboard-boot-shown");
      if (shown) {
        setIsVisible(false);
        onComplete();
        return;
      }
    }

    const typeNext = () => {
      if (currentLine >= LINES.length) {
        // All lines typed, pause then fade out
        intervalRef.current = setTimeout(() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("blockboard-boot-shown", "1");
          }
          setIsVisible(false);
          setTimeout(onComplete, 500); // Wait for fade-out animation
        }, END_PAUSE);
        return;
      }

      const line = LINES[currentLine];

      if (currentChar < line.length) {
        setVisibleLines((prev) => {
          const newLines = [...prev];
          newLines[currentLine] = line.slice(0, currentChar + 1);
          return newLines;
        });
        setCurrentChar((c) => c + 1);
        intervalRef.current = setTimeout(typeNext, CHAR_SPEED);
      } else {
        // Line complete, move to next
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        intervalRef.current = setTimeout(typeNext, LINE_PAUSE);
      }
    };

    intervalRef.current = setTimeout(typeNext, 300);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine, currentChar]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <div className="max-w-lg w-full px-6">
            <div className="font-mono text-sm text-secondary space-y-1">
              {visibleLines.map((line, i) => (
                <div key={i} className="flex">
                  <span>{line}</span>
                  {i === currentLine && currentLine < LINES.length && (
                    <span className="animate-pulse ml-0.5 text-primary">
                      _
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
