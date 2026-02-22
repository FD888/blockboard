import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerifyRequest {
  /** Одиночная монета */
  coin?: string
  /** Пакетная верификация для преподавателя */
  coins?: string[]
}

export interface SingleVerifyResult {
  coin: string
  valid: boolean
  category?: 'quiz' | 'explain'
  score?: number          // % для quiz
  nonce?: string          // уникальный идентификатор — дубли видны сразу
  duplicate?: boolean     // true если nonce уже встречался в батче
}

export interface VerifyResponse {
  /** Результат одиночной проверки */
  valid?: boolean
  category?: 'quiz' | 'explain'
  score?: number
  nonce?: string
  /** Результаты пакетной проверки */
  results?: SingleVerifyResult[]
  error?: string
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: VerifyRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Некорректный запрос.' }, { status: 400 })
  }

  // ── Пакетная верификация (для преподавателя) ───────────────────────────────
  if (body.coins) {
    if (!Array.isArray(body.coins) || body.coins.length > 500) {
      return Response.json({ error: 'coins — массив до 500 элементов.' }, { status: 400 })
    }

    const seenNonces = new Set<string>()
    const results: SingleVerifyResult[] = body.coins.map((raw) => {
      const coin = String(raw).trim()
      const result = verifyToken(coin)

      if (!result.valid) {
        return { coin, valid: false }
      }

      const isDuplicate = result.nonce ? seenNonces.has(result.nonce) : false
      if (result.nonce) seenNonces.add(result.nonce)

      return {
        coin,
        valid: true,
        category: result.category,
        score: result.score,
        nonce: result.nonce,
        duplicate: isDuplicate,
      }
    })

    return Response.json({ results } satisfies VerifyResponse)
  }

  // ── Одиночная верификация ──────────────────────────────────────────────────
  if (body.coin) {
    const result = verifyToken(String(body.coin).trim())
    return Response.json({
      valid: result.valid,
      category: result.category,
      score: result.score,
      nonce: result.nonce,
    } satisfies VerifyResponse)
  }

  return Response.json({ error: 'Передай coin или coins[].' }, { status: 400 })
}

// ── GET: быстрая проверка через URL для удобства преподавателя ─────────────
// Пример: /api/verify?coin=HK1:a3f9b2c1:quiz-90:7e4cd1f2a9b3

export async function GET(req: NextRequest) {
  const coin = new URL(req.url).searchParams.get('coin')
  if (!coin) {
    return Response.json({ error: 'Параметр: ?coin=HK1:...' }, { status: 400 })
  }

  const result = verifyToken(coin.trim())
  return Response.json({
    valid: result.valid,
    category: result.category,
    score: result.score,
    nonce: result.nonce,
  } satisfies VerifyResponse)
}
