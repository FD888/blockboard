"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { sha256 } from "@/lib/hash";
import { TextDecode } from "./TextDecode";

interface Block {
  id: number;
  data: string;
  prevHash: string;
  hash: string;
}

const INITIAL_DATA = [
  "Генезис: начало цепочки",
  "Биткоин: первая криптовалюта",
  "Эфириум: смарт-контракты",
];

export function TamperProofDemo() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isValid, setIsValid] = useState<boolean[]>([true, true, true]);

  // Compute full chain from data
  const computeChain = useCallback(async (dataArr: string[]) => {
    const newBlocks: Block[] = [];
    let prevHash = "0".repeat(64);

    for (let i = 0; i < dataArr.length; i++) {
      const hash = await sha256(prevHash + dataArr[i]);
      newBlocks.push({
        id: i,
        data: dataArr[i],
        prevHash,
        hash,
      });
      prevHash = hash;
    }

    return newBlocks;
  }, []);

  // Initialize chain
  useEffect(() => {
    computeChain(INITIAL_DATA).then(setBlocks);
  }, [computeChain]);

  // Validate chain after block edit
  const validateChain = useCallback(
    async (editedBlocks: Block[]) => {
      const valid = [true, true, true];
      // Recompute what hashes SHOULD be
      const correctChain = await computeChain(
        editedBlocks.map((b) => b.data)
      );

      for (let i = 0; i < editedBlocks.length; i++) {
        // Block is valid if its hash matches the correct computation
        if (editedBlocks[i].hash !== correctChain[i].hash) {
          valid[i] = false;
        }
        // Also invalid if prevHash doesn't match previous block's hash
        if (i > 0 && editedBlocks[i].prevHash !== editedBlocks[i - 1].hash) {
          valid[i] = false;
        }
      }

      setIsValid(valid);
    },
    [computeChain]
  );

  const handleDataChange = async (index: number, newData: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], data: newData };

    // Recompute hash for edited block (using its EXISTING prevHash — this is the key!)
    // The hash changes, but prevHash of next blocks still points to the OLD hash
    updated[index].hash = await sha256(
      updated[index].prevHash + newData
    );

    setBlocks(updated);
    validateChain(updated);
  };

  if (blocks.length === 0) return null;

  return (
    <section className="relative z-10 py-24 sm:py-32">
      <div className="container-app">
        {/* Section header */}
        <div className="text-center mb-6">
          <p className="font-mono text-xs text-spbgu-gray-dark mb-3 tracking-widest uppercase">
            Interactive demo
          </p>
          <h2 className="text-fluid-2xl font-bold text-slate-100 mb-3">
            <TextDecode
              text="Попробуй сломать цепочку"
              scrollTriggered
              speed={30}
            />
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Измени данные в любом блоке — и увидишь, как ломается вся цепочка.
            Вот почему блокчейн невозможно подделать.
          </p>
        </div>

        {/* Chain */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-0 max-w-5xl mx-auto">
          {blocks.map((block, i) => (
            <div key={block.id} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`glass-card p-4 sm:p-5 flex-1 max-w-sm mx-auto lg:mx-0 transition-all duration-300 ${
                  isValid[i]
                    ? "border-secondary/30 shadow-glow"
                    : "border-primary/50 shadow-glow-red"
                }`}
              >
                {/* Block header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-medium text-slate-300">
                    Block #{block.id}
                  </span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      isValid[i]
                        ? "bg-secondary/20 text-secondary"
                        : "bg-primary/20 text-primary-light"
                    }`}
                  >
                    {isValid[i] ? "\u2713 Valid" : "\u2717 Invalid"}
                  </span>
                </div>

                {/* Editable data field */}
                <div className="mb-3">
                  <label className="block font-mono text-xs text-spbgu-gray-dark mb-1">
                    Data:
                  </label>
                  <input
                    type="text"
                    value={block.data}
                    onChange={(e) => handleDataChange(i, e.target.value)}
                    className="w-full bg-background/80 border border-border rounded-lg px-3 py-2 font-mono text-xs text-slate-200 focus:border-secondary/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Hash display */}
                <div className="space-y-1.5">
                  <div>
                    <span className="font-mono text-xs text-spbgu-gray-dark">
                      Hash:{" "}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        isValid[i] ? "text-secondary/70" : "text-primary/70"
                      } break-all`}
                    >
                      {block.hash.slice(0, 16)}...
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-xs text-spbgu-gray-dark">
                      Prev:{" "}
                    </span>
                    <span className="font-mono text-xs text-slate-500 break-all">
                      {block.prevHash.slice(0, 16)}...
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Chain link */}
              {i < blocks.length - 1 && (
                <>
                  <div className="hidden lg:flex items-center justify-center flex-shrink-0 px-2">
                    <svg
                      width="40"
                      height="24"
                      viewBox="0 0 40 24"
                      className={`transition-colors duration-300 ${
                        isValid[i + 1]
                          ? "text-secondary/30"
                          : "text-primary/40"
                      }`}
                    >
                      <line
                        x1="0"
                        y1="12"
                        x2="28"
                        y2="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <polygon
                        points="28,6 40,12 28,18"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="lg:hidden flex justify-center">
                    <svg
                      width="24"
                      height="32"
                      viewBox="0 0 24 32"
                      className={`transition-colors duration-300 ${
                        isValid[i + 1]
                          ? "text-secondary/30"
                          : "text-primary/40"
                      }`}
                    >
                      <line
                        x1="12"
                        y1="0"
                        x2="12"
                        y2="20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <polygon
                        points="6,20 12,32 18,20"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
