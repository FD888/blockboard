"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useInView } from "framer-motion";

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
  /** If true, triggers decode when element scrolls into viewport center (85%) */
  scrollTriggered?: boolean;
}

export function TextDecode({
  text,
  className = "",
  delay = 0,
  speed = 50,
  onComplete,
  trigger = true,
  scrollTriggered = false,
}: TextDecodeProps) {
  const [displayText, setDisplayText] = useState<string>("");
  const [isStarted, setIsStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const resolvedCount = useRef(0);
  const rafId = useRef<number>(0);
  const lastTime = useRef(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  // Scroll-triggered: fire when element enters the central 85% of viewport
  const isInView = useInView(elementRef, {
    once: true,
    margin: "-8% 0px -8% 0px",
  });

  const effectiveTrigger = scrollTriggered ? isInView : trigger;

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

  // Show scrambled text before decode starts (for scroll-triggered mode)
  useEffect(() => {
    if (scrollTriggered && !isStarted && !isDone) {
      setDisplayText(scramble(0));
    }
  }, [scrollTriggered, isStarted, isDone, scramble]);

  useEffect(() => {
    if (!effectiveTrigger || isStarted) return;

    const timeout = setTimeout(() => {
      setIsStarted(true);
      resolvedCount.current = 0;
      lastTime.current = performance.now();
    }, delay);

    return () => clearTimeout(timeout);
  }, [effectiveTrigger, delay, isStarted]);

  useEffect(() => {
    if (!isStarted || isDone) return;

    const animate = (now: number) => {
      const elapsed = now - lastTime.current;

      setDisplayText(scramble(resolvedCount.current));

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

  // Before trigger: show scrambled (scroll mode) or invisible (manual mode)
  if (!effectiveTrigger && !isStarted) {
    if (scrollTriggered) {
      return (
        <span ref={elementRef} className={className} aria-label={text}>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true" className="font-mono">
            {displayText || scramble(0)}
          </span>
        </span>
      );
    }
    return (
      <span ref={elementRef} className={className} aria-label={text}>
        <span className="invisible">{text}</span>
      </span>
    );
  }

  return (
    <span ref={elementRef} className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="font-mono">
        {displayText || "\u00A0".repeat(text.length)}
      </span>
    </span>
  );
}
