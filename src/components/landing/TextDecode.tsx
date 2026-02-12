"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const HEX_CHARS = "0123456789ABCDEF";

interface TextDecodeProps {
  text: string;
  className?: string;
  delay?: number;
  /** Milliseconds per character resolve step */
  speed?: number;
  onComplete?: () => void;
  /** If true, starts the animation. If false, shows nothing until triggered. */
  trigger?: boolean;
}

export function TextDecode({
  text,
  className = "",
  delay = 0,
  speed = 50,
  onComplete,
  trigger = true,
}: TextDecodeProps) {
  const [displayText, setDisplayText] = useState<string>("");
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const resolvedCount = useRef(0);
  const rafId = useRef<number>(0);
  const lastTime = useRef(0);

  const scramble = useCallback(
    (resolved: number): string => {
      return text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < resolved) return char;
          return HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
        })
        .join("");
    },
    [text]
  );

  useEffect(() => {
    if (!trigger) return;

    const timeout = setTimeout(() => {
      setIsStarted(true);
      resolvedCount.current = 0;
      lastTime.current = performance.now();
    }, delay);

    return () => clearTimeout(timeout);
  }, [trigger, delay]);

  useEffect(() => {
    if (!isStarted || isDone) return;

    const animate = (now: number) => {
      const elapsed = now - lastTime.current;

      // Update scramble every frame for smooth randomness
      setDisplayText(scramble(resolvedCount.current));

      // Resolve next character at the speed interval
      if (elapsed >= speed) {
        resolvedCount.current++;
        lastTime.current = now;

        if (resolvedCount.current > text.length) {
          setDisplayText(text);
          setIsDone(true);
          onComplete?.();
          return;
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isStarted, isDone, text, speed, scramble, onComplete]);

  if (!trigger && !isStarted) {
    return (
      <span className={className} aria-label={text}>
        <span className="invisible">{text}</span>
      </span>
    );
  }

  return (
    <span className={className} aria-label={text}>
      {/* Screen reader sees the real text immediately */}
      <span className="sr-only">{text}</span>
      {/* Visual: animated decode */}
      <span aria-hidden="true" className="font-mono">
        {displayText || "\u00A0".repeat(text.length)}
      </span>
    </span>
  );
}
