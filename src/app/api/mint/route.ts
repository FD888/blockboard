import type { NextRequest } from 'next/server'
import { generateToken } from '@/lib/tokens'

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// Ограничение: 5 токенов с одного IP в час.
// In-memory — сбрасывается при перезапуске функции.
// Для образовательного проекта этого достаточно.

const MAX_PER_HOUR = 5
const ipCounts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + 3_600_000 })
    return false
  }
  if (entry.count >= MAX_PER_HOUR) return true
  entry.count++
  return false
}

// ─── Request / response types ─────────────────────────────────────────────────

export type MintRequest =
  | { activity: 'quiz'; topic: string; score: number; total: number }
  | { activity: 'explain'; concept: string }

export interface MintResponse {
  coin: string
  label: string
  date: string
  error?: string
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Стоп. Слишком много за час. Комбат засёк — подожди.' },
      { status: 429 },
    )
  }

  let body: MintRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Некорректный запрос.' }, { status: 400 })
  }

  const date = new Date().toISOString().split('T')[0]

  if (body.activity === 'quiz') {
    const { topic, score, total } = body

    if (!topic || typeof score !== 'number' || typeof total !== 'number' || total <= 0) {
      return Response.json({ error: 'Неверные параметры.' }, { status: 400 })
    }

    const pct = Math.round((score / total) * 100)

    if (pct < 70) {
      return Response.json(
        { error: `${pct}% — не прошёл. Нужно ≥70%. Ещё раз.` },
        { status: 403 },
      )
    }

    const coin = generateToken(`quiz-${pct}`)
    const label = `Квиз (${pct}%) · ${topic}`
    return Response.json({ coin, label, date } satisfies MintResponse)
  }

  if (body.activity === 'explain') {
    const { concept } = body

    if (!concept || concept.trim().length < 2) {
      return Response.json({ error: 'Неверные параметры.' }, { status: 400 })
    }

    const coin = generateToken('explain')
    const label = `Объяснение · ${concept.trim()}`
    return Response.json({ coin, label, date } satisfies MintResponse)
  }

  return Response.json({ error: 'Неизвестная активность.' }, { status: 400 })
}
