import { createHmac } from 'crypto'
import type { NextRequest } from 'next/server'

// ─── HODL coin minting ────────────────────────────────────────────────────────
// Proof-of-Learning: students earn cryptographically signed tokens
// by scoring ≥70% on quizzes. Coins are verified server-side via HMAC-SHA256.

const HODL_SECRET = process.env.HODL_SECRET ?? 'hodl-blockboard-default-dev'
const MIN_SCORE_PCT = 70

export interface MintRequest {
  topic: string
  score: number
  total: number
}

export interface MintResponse {
  coin: string
  topic: string
  pct: number
  date: string
  error?: string
}

function mintCoin(topic: string, pct: number): string {
  const normalised = topic.trim().toLowerCase()
  const hmac = createHmac('sha256', HODL_SECRET)
    .update(`${normalised}|${pct}`)
    .digest('hex')
  return `HODL-${hmac.substring(0, 16).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  let body: MintRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Некорректный запрос.' }, { status: 400 })
  }

  const { topic, score, total } = body

  if (!topic || typeof score !== 'number' || typeof total !== 'number' || total <= 0) {
    return Response.json({ error: 'Неверные параметры.' }, { status: 400 })
  }

  const pct = Math.round((score / total) * 100)

  if (pct < MIN_SCORE_PCT) {
    return Response.json(
      {
        error: `Нужно набрать минимум ${MIN_SCORE_PCT}% для получения монетки. У тебя ${pct}% — попробуй ещё раз! 🐹`,
      },
      { status: 403 },
    )
  }

  const coin = mintCoin(topic, pct)
  const date = new Date().toISOString().split('T')[0]

  return Response.json({ coin, topic, pct, date } satisfies MintResponse)
}
