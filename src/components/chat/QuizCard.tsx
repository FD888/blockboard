'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuizAction } from '@/types/chat'

interface QuizCardProps {
  action: QuizAction
}

// ─── Wallet helpers (localStorage) ────────────────────────────────────────────

export interface HodlCoin {
  coin: string
  topic: string
  pct: number
  date: string
}

export function saveHodlCoin(entry: HodlCoin) {
  try {
    const raw = localStorage.getItem('hodl_wallet')
    const wallet: HodlCoin[] = raw ? JSON.parse(raw) : []
    // Avoid duplicates by coin value
    if (!wallet.some((c) => c.coin === entry.coin)) {
      wallet.unshift(entry)
      localStorage.setItem('hodl_wallet', JSON.stringify(wallet))
    }
  } catch {
    // localStorage unavailable (SSR / private mode) — silently skip
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizCard({ action }: QuizCardProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  // Mint state
  const [mintState, setMintState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [mintedCoin, setMintedCoin] = useState<string | null>(null)
  const [mintError, setMintError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const question = action.questions[current]
  const total = action.questions.length

  function handleSelect(idx: number) {
    if (revealed) return
    setSelected(idx)
  }

  function handleReveal() {
    if (selected === null) return
    setRevealed(true)
    if (selected === question.correct) {
      setScore((s) => s + 1)
    }
  }

  function handleNext() {
    if (current + 1 >= total) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  function handleRestart() {
    setCurrent(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    setFinished(false)
    setMintState('idle')
    setMintedCoin(null)
    setMintError(null)
    setCopied(false)
  }

  async function handleMint(finalScore: number) {
    setMintState('loading')
    setMintError(null)
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: action.topic, score: finalScore, total }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMintError(data.error ?? 'Ошибка минтинга')
        setMintState('error')
        return
      }
      setMintedCoin(data.coin)
      setMintState('done')
      saveHodlCoin({ coin: data.coin, topic: data.topic, pct: data.pct, date: data.date })
    } catch {
      setMintError('Не удалось связаться с сервером.')
      setMintState('error')
    }
  }

  async function handleCopy() {
    if (!mintedCoin) return
    try {
      await navigator.clipboard.writeText(mintedCoin)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable
    }
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    const passed = pct >= 70
    const grade =
      pct >= 80 ? 'Отлично! 🎉' : pct >= 70 ? 'Хорошо! 👍' : pct >= 60 ? 'Неплохо 👌' : 'Попробуй ещё раз 💪'

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4"
      >
        {/* Score */}
        <div className="text-center">
          <p className="text-lg font-bold text-white">{grade}</p>
          <p className="mt-1 text-sm text-gray-300">
            Правильных ответов: {score} из {total} ({pct}%)
          </p>
        </div>

        {/* Mint section */}
        {passed && mintState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3"
          >
            <p className="text-xs text-yellow-300/90">
              🐾 Ты набрал ≥70%! Ходлер одобряет. Получи HODL-монетку — запиши её в кошелёк.
            </p>
            <button
              onClick={() => handleMint(score)}
              className="mt-2 w-full rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-300 transition-all hover:bg-yellow-500/30 active:scale-95"
            >
              💰 Получить монетку
            </button>
          </motion.div>
        )}

        {mintState === 'loading' && (
          <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
            <p className="text-xs text-yellow-300/70 animate-pulse">🐹 Майним монетку... крутим колесо...</p>
          </div>
        )}

        {mintState === 'done' && mintedCoin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-lg border border-yellow-400/40 bg-yellow-500/10 p-3"
          >
            <p className="text-xs font-semibold text-yellow-300 mb-1">🎖 Твоя HODL-монетка:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-black/30 px-2 py-1.5 font-mono text-xs text-yellow-200">
                {mintedCoin}
              </code>
              <button
                onClick={handleCopy}
                title="Скопировать"
                className="shrink-0 rounded-lg border border-yellow-500/30 p-1.5 text-yellow-300 transition-colors hover:bg-yellow-500/20"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-yellow-300/50">
              Сохрани монетку — покажи Ходлеру на странице кошелька или преподавателю.
            </p>
          </motion.div>
        )}

        {mintState === 'error' && mintError && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
            {mintError}
          </div>
        )}

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="mt-3 rounded-lg border border-secondary/40 px-4 py-1.5 text-sm text-secondary transition-colors hover:bg-secondary/10"
        >
          Пройти снова
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-white/10 bg-surface/60 p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-secondary">
          {action.topic}
        </span>
        <span className="font-mono text-xs text-gray-500">
          {current + 1} / {total}
        </span>
      </div>

      {/* Question */}
      <p className="mb-3 text-sm font-medium leading-relaxed text-white">
        {question.question}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((opt, idx) => {
          let variantClass =
            'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10'

          if (revealed) {
            if (idx === question.correct) {
              variantClass = 'border-green-500/50 bg-green-500/10 text-green-300'
            } else if (idx === selected) {
              variantClass = 'border-red-500/50 bg-red-500/10 text-red-300'
            } else {
              variantClass = 'border-white/5 bg-white/5 text-gray-500'
            }
          } else if (idx === selected) {
            variantClass =
              'border-secondary/60 bg-secondary/10 text-white'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${variantClass}`}
            >
              <span className="font-mono mr-2 text-xs opacity-60">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {revealed && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 text-xs leading-relaxed text-gray-400"
          >
            💡 {question.explanation}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className="rounded-lg bg-secondary/20 px-4 py-1.5 text-sm font-medium text-secondary transition-all hover:bg-secondary/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-lg bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/30"
          >
            {current + 1 < total ? 'Следующий →' : 'Результат'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
