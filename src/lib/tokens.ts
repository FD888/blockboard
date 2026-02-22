import { createHmac, randomBytes } from 'crypto'

// ─── HK token format: HK1:{nonce8}:{activity}:{hmac12} ───────────────────────
// nonce8   — 8 random hex chars (32 bits) — гарантирует уникальность монеты
// activity — 'quiz-{score}' | 'explain'
// hmac12   — первые 12 hex-символов HMAC-SHA256(SECRET, "{nonce8}:{activity}")
//
// Верификация не требует БД: достаточно пересчитать HMAC и сравнить.
// Уникальность обеспечивается nonce — два одинаковых результата дадут
// разные монеты с вероятностью коллизии 1/2^32 ≈ ничтожно малой.

const SECRET = process.env.HODL_SECRET ?? 'hk-blockboard-dev-secret'

export type TokenActivity = `quiz-${number}` | 'explain'

export interface TokenPayload {
  nonce: string
  activity: TokenActivity
}

export interface VerifyResult {
  valid: boolean
  activity?: TokenActivity
  nonce?: string
  /** 'quiz' | 'explain' — категория активности */
  category?: 'quiz' | 'explain'
  /** Процент правильных ответов (только для quiz) */
  score?: number
}

export function generateToken(activity: TokenActivity): string {
  const nonce = randomBytes(4).toString('hex') // 8 hex chars
  const payload = `${nonce}:${activity}`
  const hmac = createHmac('sha256', SECRET).update(payload).digest('hex')
  return `HK1:${nonce}:${activity}:${hmac.substring(0, 12)}`
}

export function verifyToken(coin: string): VerifyResult {
  // Ожидаемый формат: HK1:{nonce8}:{activity}:{hmac12}
  const parts = coin.trim().split(':')
  if (parts.length !== 4 || parts[0] !== 'HK1') return { valid: false }

  const [, nonce, activity, hmac] = parts

  if (!nonce || !activity || !hmac) return { valid: false }

  const payload = `${nonce}:${activity}`
  const expected = createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 12)

  if (hmac !== expected) return { valid: false }

  const category = activity === 'explain' ? 'explain' : activity.startsWith('quiz-') ? 'quiz' : undefined
  if (!category) return { valid: false }

  const score = category === 'quiz' ? parseInt(activity.replace('quiz-', ''), 10) : undefined

  return {
    valid: true,
    activity: activity as TokenActivity,
    nonce,
    category,
    score,
  }
}
