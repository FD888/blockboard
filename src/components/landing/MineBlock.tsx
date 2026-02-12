"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { sha256 } from "@/lib/hash";
import { TextDecode } from "./TextDecode";

const DIFFICULTY = 3; // Hash must start with this many zeros
const TARGET_PREFIX = "0".repeat(DIFFICULTY);
const DATA = "BlockBoard Lecture #1";

export function MineBlock() {
  const [nonce, setNonce] = useState(0);
  const [hash, setHash] = useState("click to start mining...");
  const [isMining, setIsMining] = useState(false);
  const [isMined, setIsMined] = useState(false);
  const [hashesPerSecond, setHashesPerSecond] = useState(0);
  const miningRef = useRef(false);
  const nonceRef = useRef(0);

  const mineStep = useCallback(async () => {
    if (!miningRef.current) return;

    const batchSize = 50;
    const startTime = performance.now();

    for (let i = 0; i < batchSize; i++) {
      if (!miningRef.current) return;

      nonceRef.current++;
      const currentNonce = nonceRef.current;
      const input = `${DATA}:${currentNonce}`;
      const h = await sha256(input);

      setNonce(currentNonce);
      setHash(h);

      if (h.startsWith(TARGET_PREFIX)) {
        miningRef.current = false;
        setIsMining(false);
        setIsMined(true);
        return;
      }
    }

    const elapsed = performance.now() - startTime;
    setHashesPerSecond(Math.round((batchSize / elapsed) * 1000));

    // Continue mining in the next frame
    if (miningRef.current) {
      requestAnimationFrame(() => mineStep());
    }
  }, []);

  const startMining = () => {
    if (isMined) {
      // Reset
      setIsMined(false);
      setNonce(0);
      setHash("click to start mining...");
      nonceRef.current = 0;
      return;
    }

    if (isMining) {
      miningRef.current = false;
      setIsMining(false);
      return;
    }

    miningRef.current = true;
    setIsMining(true);
    nonceRef.current = nonce;
    mineStep();
  };

  return (
    <section className="relative z-10 py-24 sm:py-32">
      <div className="container-app">
        <div className="text-center mb-6">
          <p className="font-mono text-xs text-spbgu-gray-dark mb-3 tracking-widest uppercase">
            Proof of Work
          </p>
          <h2 className="text-fluid-2xl font-bold text-slate-100 mb-3">
            <TextDecode
              text="Замайни свой блок"
              scrollTriggered
              speed={30}
            />
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Найди nonce, при котором хэш начинается с &quot;{TARGET_PREFIX}&quot;.
            Именно так работает Proof-of-Work.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="glass-card p-6">
            {/* Data field */}
            <div className="mb-4">
              <span className="font-mono text-xs text-spbgu-gray-dark">
                Data:{" "}
              </span>
              <span className="font-mono text-xs text-slate-300">{DATA}</span>
            </div>

            {/* Nonce */}
            <div className="mb-4">
              <span className="font-mono text-xs text-spbgu-gray-dark">
                Nonce:{" "}
              </span>
              <span className="font-mono text-sm text-slate-100 font-medium">
                {nonce.toLocaleString()}
              </span>
            </div>

            {/* Target */}
            <div className="mb-4">
              <span className="font-mono text-xs text-spbgu-gray-dark">
                Target:{" "}
              </span>
              <span className="font-mono text-xs text-secondary">
                hash must start with &quot;{TARGET_PREFIX}&quot;
              </span>
            </div>

            {/* Hash display */}
            <div className="mb-6 p-3 bg-background/80 rounded-lg border border-border">
              <span className="font-mono text-xs text-spbgu-gray-dark block mb-1">
                Hash:
              </span>
              <span
                className={`font-mono text-xs break-all ${
                  isMined
                    ? "text-secondary font-medium"
                    : isMining
                      ? "text-slate-300"
                      : "text-slate-500"
                }`}
              >
                {hash.startsWith(TARGET_PREFIX) ? (
                  <>
                    <span className="text-secondary font-bold">
                      {hash.slice(0, DIFFICULTY)}
                    </span>
                    {hash.slice(DIFFICULTY)}
                  </>
                ) : (
                  hash
                )}
              </span>
            </div>

            {/* Speed indicator */}
            {isMining && (
              <div className="mb-4 text-center">
                <span className="font-mono text-xs text-spbgu-gray-dark">
                  {hashesPerSecond.toLocaleString()} h/s
                </span>
              </div>
            )}

            {/* Mine button */}
            <button
              onClick={startMining}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                isMined
                  ? "bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30"
                  : isMining
                    ? "bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary/30"
                    : "bg-primary hover:bg-primary-dark text-white shadow-glow-red"
              }`}
            >
              {isMined
                ? "Block Mined! (reset)"
                : isMining
                  ? "Stop mining"
                  : "Start mining"}
            </button>

            {/* Success message */}
            {isMined && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg text-center"
              >
                <p className="font-mono text-sm text-secondary font-medium">
                  Block mined at nonce {nonce.toLocaleString()}!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  В реальном биткоине это занимает ~10 минут
                  для всей сети.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
