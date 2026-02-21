import { createHmac } from 'crypto'
import type { NextRequest } from 'next/server'

// ─── HODL coin verification ───────────────────────────────────────────────────
// Teachers use this endpoint to verify student-submitted HODL coins.

const HODL_SECRET = process.env.HODL_SECRET ?? 'hodl-blockboard-default-dev'

export interface VerifyRequest {
  coin: string
  topic: string
  pct: number
}

export interface VerifyResponse {
  valid: boolean
  topic?: string
  pct?: number
  error?: string
}

function expectedCoin(topic: string, pct: number): string {
  const normalised = topic.trim().toLowerCase()
  const hmac = createHmac('sha256', HODL_SECRET)
    .update(`${normalised}|${pct}`)
    .digest('hex')
  return `HODL-${hmac.substring(0, 16).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  let body: VerifyRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Некорректный запрос.' }, { status: 400 })
  }

  const { coin, topic, pct } = body

  if (!coin || !topic || typeof pct !== 'number') {
    return Response.json({ error: 'Неверные параметры.' }, { status: 400 })
  }

  const computed = expectedCoin(topic, pct)
  const valid = coin.toUpperCase() === computed

  return Response.json({ valid, topic: valid ? topic : undefined, pct: valid ? pct : undefined } satisfies VerifyResponse)
}

// Also support GET for quick verification via URL params (for teacher convenience)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const coin = searchParams.get('coin')
  const topic = searchParams.get('topic')
  const pctStr = searchParams.get('pct')

  if (!coin || !topic || !pctStr) {
    return Response.json({ error: 'Параметры: coin, topic, pct' }, { status: 400 })
  }

  const pct = parseInt(pctStr, 10)
  if (isNaN(pct)) {
    return Response.json({ error: 'pct должен быть числом' }, { status: 400 })
  }

  const computed = expectedCoin(topic, pct)
  const valid = coin.toUpperCase() === computed

  return Response.json({ valid, topic: valid ? topic : undefined, pct: valid ? pct : undefined } satisfies VerifyResponse)
}
