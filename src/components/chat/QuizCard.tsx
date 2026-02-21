'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuizAction } from '@/types/chat'

interface QuizCardProps {
  action: QuizAction
}

export function QuizCard({ action }: QuizCardProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

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
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    const grade =
      pct >= 80 ? 'Отлично! 🎉' : pct >= 60 ? 'Хорошо! 👍' : 'Попробуй ещё раз 💪'
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-center"
      >
        <p className="text-lg font-bold text-white">{grade}</p>
        <p className="mt-1 text-sm text-gray-300">
          Правильных ответов: {score} из {total} ({pct}%)
        </p>
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
