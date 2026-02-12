"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { sha256 } from "@/lib/hash";
import { TextDecode } from "./TextDecode";

export function HashInput() {
  const [input, setInput] = useState("BlockBoard");
  const [hash, setHash] = useState("");
  const [prevHash, setPrevHash] = useState("");
  const [diffCount, setDiffCount] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const compute = async () => {
      const h = await sha256(input || " ");
      setPrevHash(hash);
      setHash(h);

      // Count character differences
      if (hash && !isFirstRender.current) {
        let diffs = 0;
        for (let i = 0; i < h.length; i++) {
          if (h[i] !== hash[i]) diffs++;
        }
        setDiffCount(diffs);
      }
      isFirstRender.current = false;
    };
    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return (
    <section className="relative z-10 py-24 sm:py-32">
      <div className="container-app">
        <div className="text-center mb-6">
          <p className="font-mono text-xs text-spbgu-gray-dark mb-3 tracking-widest uppercase">
            Avalanche effect
          </p>
          <h2 className="text-fluid-2xl font-bold text-slate-100 mb-3">
            <TextDecode
              text="Лавинный эффект"
              scrollTriggered
              speed={30}
            />
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Измени одну букву — хэш изменится полностью.
            Вот почему блокчейн невозможно взломать подбором.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="glass-card p-6">
            {/* Input */}
            <div className="mb-5">
              <label className="block font-mono text-xs text-spbgu-gray-dark mb-2">
                Input:
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Введи что угодно..."
                className="w-full bg-background/80 border border-border rounded-lg px-4 py-3 font-mono text-sm text-slate-200 focus:border-secondary/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Hash output */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-spbgu-gray-dark">
                  SHA-256:
                </span>
                {diffCount > 0 && prevHash && (
                  <motion.span
                    key={diffCount}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-mono text-xs text-primary"
                  >
                    {diffCount}/64 символов изменилось
                  </motion.span>
                )}
              </div>
              <div className="p-3 bg-background/80 rounded-lg border border-border">
                <p className="font-mono text-xs break-all leading-relaxed">
                  {hash.split("").map((char, i) => (
                    <span
                      key={`${i}-${char}`}
                      className={
                        prevHash && prevHash[i] !== char
                          ? "text-primary font-bold"
                          : "text-secondary/70"
                      }
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Fun info */}
            <p className="text-xs text-slate-500 text-center font-mono">
              2^256 возможных хэшей &asymp; больше, чем атомов во Вселенной
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
