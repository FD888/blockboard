'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { readWallet } from '@/components/chat/QuizCard'
import type { HodlCoin } from '@/types/chat'

// ─── Inline verify form ────────────────────────────────────────────────────────

function VerifyForm() {
  const [coin, setCoin] = useState('')
  const [result, setResult] = useState<{ valid: boolean; category?: string; score?: number } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!coin.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin: coin.trim() }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ valid: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">HK-токен</label>
        <input
          type="text"
          value={coin}
          onChange={(e) => setCoin(e.target.value)}
          placeholder="HK1:a3f9b2c1:quiz-90:7e4cd1f2a9b3"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-gray-600 focus:border-yellow-500/40 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !coin.trim()}
        className="w-full rounded-lg bg-yellow-500/20 px-3 py-2 text-xs font-semibold text-yellow-300 transition-colors hover:bg-yellow-500/30 disabled:opacity-50"
      >
        {loading ? 'Проверяем...' : 'Верифицировать'}
      </button>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-lg border p-3 text-xs ${
              result.valid
                ? 'border-green-500/40 bg-green-500/10 text-green-300'
                : 'border-red-500/40 bg-red-500/10 text-red-400'
            }`}
          >
            {result.valid ? (
              <span>
                ✅ Токен подлинный ·{' '}
                {result.category === 'quiz' ? `Квиз (${result.score}%)` : 'Объяснение'}
              </span>
            ) : (
              <span>❌ Токен не прошёл проверку.</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

// ─── Main wallet component ─────────────────────────────────────────────────────

interface BotWalletProps {
  refreshKey?: number
}

export function BotWallet({ refreshKey = 0 }: BotWalletProps) {
  const [coins, setCoins] = useState<HodlCoin[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [showVerify, setShowVerify] = useState(false)

  useEffect(() => {
    setCoins(readWallet())
  }, [refreshKey])

  async function handleCopy(coin: string, idx: number) {
    try {
      await navigator.clipboard.writeText(coin)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">🎒 Кошелёк</h2>
          <p className="text-xs text-gray-500">
            {coins.length} {coins.length === 1 ? 'токен' : coins.length < 5 ? 'токена' : 'токенов'}
          </p>
        </div>
        <button
          onClick={() => setShowVerify((v) => !v)}
          className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
            showVerify
              ? 'border-yellow-500/40 bg-yellow-500/20 text-yellow-300'
              : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
          }`}
        >
          {showVerify ? '← Кошелёк' : '🔍 Проверить'}
        </button>
      </div>

      {showVerify ? (
        <VerifyForm />
      ) : coins.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <span className="text-3xl">🐹</span>
          <p className="text-sm text-gray-500">Кошелёк пуст</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Пройди квиз на ≥70% или объясни ХК понятие — получишь токен.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto [scrollbar-width:thin]">
          <AnimatePresence initial={false}>
            {coins.map((entry, idx) => (
              <motion.div
                key={entry.coin}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3"
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-yellow-200">{entry.label}</p>
                    <p className="text-[10px] text-yellow-300/50">{entry.date}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">
                    {entry.label.startsWith('Объяснение') ? '🧠' : '🎯'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <code className="min-w-0 flex-1 truncate rounded bg-black/30 px-2 py-1 font-mono text-[10px] text-yellow-200/80">
                    {entry.coin}
                  </code>
                  <button
                    onClick={() => handleCopy(entry.coin, idx)}
                    title="Скопировать"
                    className="shrink-0 rounded p-1 text-yellow-400/60 transition-colors hover:text-yellow-300"
                  >
                    {copiedIdx === idx ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
