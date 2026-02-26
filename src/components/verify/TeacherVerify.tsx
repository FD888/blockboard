'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifyResult {
  coin: string
  valid: boolean
  category?: 'quiz' | 'explain'
  score?: number
  lectureNumber?: number
  nonce?: string
  duplicate?: boolean
}

const TOTAL_LECTURES = 3
const LECTURE_LABELS: Record<number, string> = {
  2: 'Технология блокчейн',
  3: 'Майнинг и консенсус',
  4: 'Смарт-контракты и DeFi',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function activityLabel(r: VerifyResult): string {
  if (!r.valid) return '—'
  if (r.category === 'quiz') {
    const lec = r.lectureNumber ? ` Л${r.lectureNumber}` : ''
    return `Квиз${lec} (${r.score}%)`
  }
  if (r.category === 'explain') return 'Объяснение'
  return '—'
}

function lectureCell(r: VerifyResult): string {
  if (!r.valid || r.category !== 'quiz' || !r.lectureNumber) return '—'
  return `Л${r.lectureNumber}`
}

/** Считает уникальные лекции из валидных (не-дублей) квиз-токенов */
function countUniqueLectures(results: VerifyResult[]): number {
  const lectures = new Set<number>()
  results.forEach((r) => {
    if (r.valid && !r.duplicate && r.category === 'quiz' && r.lectureNumber) {
      lectures.add(r.lectureNumber)
    }
  })
  return lectures.size
}

function exportCSV(results: VerifyResult[]) {
  const rows = [
    ['Токен', 'Статус', 'Лекция', 'Активность', 'Дубль', 'Nonce'],
    ...results.map((r) => [
      r.coin,
      r.valid ? 'OK' : 'INVALID',
      lectureCell(r),
      activityLabel(r),
      r.duplicate ? 'ДА' : 'нет',
      r.nonce ?? '',
    ]),
  ]
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hk-tokens-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TeacherVerify() {
  const [raw, setRaw] = useState('')
  const [results, setResults] = useState<VerifyResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerify() {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return
    if (lines.length > 500) {
      setError('Максимум 500 токенов за раз.')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: lines }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Ошибка сервера.')
        return
      }
      setResults(data.results)
    } catch {
      setError('Не удалось связаться с сервером.')
    } finally {
      setLoading(false)
    }
  }

  const validCount = results?.filter((r) => r.valid && !r.duplicate).length ?? 0
  const invalidCount = results?.filter((r) => !r.valid).length ?? 0
  const dupCount = results?.filter((r) => r.duplicate).length ?? 0
  const uniqueLectureCount = results ? countUniqueLectures(results) : 0

  return (
    <div className="min-h-screen bg-[#0a0e1a] px-4 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Заголовок */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 text-3xl">
              🎖
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Верификация токенов</h1>
          <p className="mt-2 text-sm text-gray-400">
            Страница для преподавателя. Вставьте токены студентов — по одному на строку.
            Система проверит подлинность и найдёт дубли.
          </p>
        </div>

        {/* Инструкция */}
        <div className="mb-6 rounded-xl border border-white/8 bg-white/3 p-4 text-xs text-gray-400 space-y-1">
          <p><span className="text-yellow-400 font-medium">Формат токена:</span> <code className="font-mono text-yellow-200/80">HK1:a3f9b2c1:quiz-L2-86:7e4cd1f2a9b3</code></p>
          <p className="text-gray-500">quiz-L<span className="text-yellow-200/60">N</span>-<span className="text-yellow-200/60">score</span> — N = номер лекции (2, 3, 4), score = % правильных ответов</p>
          <p><span className="text-green-400 font-medium">✅ Подлинный</span> — HMAC-подпись верна, токен выдан сервером</p>
          <p><span className="text-red-400 font-medium">❌ Недействительный</span> — подпись не совпадает, токен сфабрикован</p>
          <p><span className="text-orange-400 font-medium">⚠️ Дубль</span> — тот же nonce уже встречался в этой партии</p>
        </div>

        {/* Ввод токенов */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Токены студентов (один на строку)
          </label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={`HK1:a3f9b2c1:quiz-90:7e4cd1f2a9b3\nHK1:ff3a9b2c:explain:c1d2e3f4a5b6\n...`}
            rows={8}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-xs text-white placeholder-gray-600 focus:border-yellow-500/40 focus:outline-none resize-none"
          />
          <p className="mt-1 text-right text-[10px] text-gray-600">
            {raw.split('\n').filter((l) => l.trim()).length} / 500 токенов
          </p>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || !raw.trim()}
          className="w-full rounded-xl bg-yellow-500/20 px-6 py-3 text-sm font-bold text-yellow-300 transition-all hover:bg-yellow-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Проверяем...' : '🔍 Верифицировать'}
        </button>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Результаты */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              {/* Сводка */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3 text-center">
                  <p className="text-xl font-bold text-green-400">{validCount}</p>
                  <p className="text-[10px] text-green-500/70">подлинных</p>
                </div>
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 text-center">
                  <p className="text-xl font-bold text-orange-400">{dupCount}</p>
                  <p className="text-[10px] text-orange-500/70">дублей</p>
                </div>
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{invalidCount}</p>
                  <p className="text-[10px] text-red-500/70">недействительных</p>
                </div>
              </div>

              {/* Охват лекций */}
              {uniqueLectureCount > 0 && (
                <div className={`mb-4 rounded-xl border p-4 ${
                  uniqueLectureCount >= TOTAL_LECTURES
                    ? 'border-yellow-500/40 bg-yellow-500/10'
                    : 'border-white/8 bg-white/3'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-300">
                      Квизы по лекциям
                    </p>
                    <span className={`text-xs font-bold ${
                      uniqueLectureCount >= TOTAL_LECTURES ? 'text-yellow-300' : 'text-gray-400'
                    }`}>
                      {uniqueLectureCount >= TOTAL_LECTURES ? '🎖 ' : ''}{uniqueLectureCount} из {TOTAL_LECTURES} лекций
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[2, 3, 4].map((n) => {
                      const covered = results?.some(
                        (r) => r.valid && !r.duplicate && r.category === 'quiz' && r.lectureNumber === n
                      )
                      return (
                        <span
                          key={n}
                          className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                            covered
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-white/5 text-gray-600 border border-white/8'
                          }`}
                        >
                          {covered ? '✓ ' : ''}Л{n} · {LECTURE_LABELS[n]}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Кнопка экспорта */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => exportCSV(results)}
                  className="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-gray-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  ⬇ Скачать CSV
                </button>
              </div>

              {/* Таблица */}
              <div className="overflow-hidden rounded-xl border border-white/8">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      <th className="px-4 py-2 text-left font-semibold text-gray-400">#</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-400">Токен</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-400">Лекция</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-400">Активность</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-400">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-white/5 transition-colors ${
                          r.duplicate
                            ? 'bg-orange-500/5'
                            : r.valid
                            ? 'bg-green-500/3'
                            : 'bg-red-500/5'
                        }`}
                      >
                        <td className="px-4 py-2.5 font-mono text-gray-600">{idx + 1}</td>
                        <td className="px-4 py-2.5">
                          <code className="font-mono text-[10px] text-gray-300 break-all">{r.coin}</code>
                        </td>
                        <td className="px-3 py-2.5">
                          {r.valid && r.category === 'quiz' && r.lectureNumber ? (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                              Л{r.lectureNumber}
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-gray-300">{activityLabel(r)}</td>
                        <td className="px-4 py-2.5">
                          {r.duplicate ? (
                            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">⚠ дубль</span>
                          ) : r.valid ? (
                            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">✅ ок</span>
                          ) : (
                            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">❌ фейк</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-center text-[10px] text-gray-600">
                Сохраните CSV-файл после каждой сессии верификации — он служит записью о принятых токенах.
                При следующей проверке вставьте старые nonce-ы, чтобы обнаружить повторную сдачу.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
