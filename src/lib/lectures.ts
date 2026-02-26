import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { LectureMeta, LectureChunk } from '@/types/chat'

const LECTURES_DIR = path.join(process.cwd(), 'content', 'lectures')

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LectureDetail {
  slug: string
  number: number
  title: string
  short: string
  medium: string
  full: string
  terms: string
  conclusion: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract lecture number from filename, e.g. "Конспект_Лекция_2_Блокчейн.md" → 2 */
function extractNumber(filename: string): number {
  const match = filename.match(/Лекция[_\s](\d+)/i)
  return match ? parseInt(match[1], 10) : 0
}

/** Extract title from first # heading in content */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : ''
}

/**
 * Parse markdown content into named sections.
 * Sections are identified by their ## emoji headers.
 */
function parseLectureSections(content: string): Omit<LectureDetail, 'slug' | 'number' | 'title'> {
  const parts = content.split(/\n(?=## )/)

  const result = { short: '', medium: '', full: '', terms: '', conclusion: '' }

  for (const part of parts) {
    const lines = part.split('\n')
    const header = lines[0] ?? ''
    // Remove leading --- separators and trim
    const body = lines
      .slice(1)
      .join('\n')
      .replace(/^\s*---\s*/m, '')
      .trim()

    if (header.includes('⚡') || header.includes('30 секунд')) {
      result.short = body
    } else if (header.includes('📖') || header.includes('10 минут')) {
      result.medium = body
    } else if (header.includes('📚') || header.includes('Полный')) {
      result.full = body
    } else if (header.includes('🔑') || /термин/i.test(header)) {
      result.terms = body
    } else if (header.includes('✅') || /итог/i.test(header)) {
      result.conclusion = body
    }
  }

  return result
}

// ─── Load all lecture metadata ────────────────────────────────────────────────

export function getLectureMetas(): LectureMeta[] {
  if (!fs.existsSync(LECTURES_DIR)) return []

  const files = fs.readdirSync(LECTURES_DIR).filter((f) => f.endsWith('.md'))

  return files
    .map((filename) => {
      const filePath = path.join(LECTURES_DIR, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { content } = matter(raw)
      const number = extractNumber(filename)
      const slug = String(number)
      const title = extractTitle(content)
      return {
        slug,
        title,
        number,
      } as LectureMeta
    })
    .sort((a, b) => a.number - b.number)
}

// ─── Load single lecture with all sections ───────────────────────────────────

export function getLectureBySlug(slug: string): LectureDetail | null {
  if (!fs.existsSync(LECTURES_DIR)) return null

  const files = fs.readdirSync(LECTURES_DIR).filter((f) => f.endsWith('.md'))

  for (const filename of files) {
    const number = extractNumber(filename)
    if (String(number) !== slug) continue

    const filePath = path.join(LECTURES_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(raw)
    const title = extractTitle(content)
    const sections = parseLectureSections(content)

    return { slug, number, title, ...sections }
  }

  return null
}

// ─── Load full lecture content ────────────────────────────────────────────────

export function getLectureContent(slug: string): string | null {
  if (!fs.existsSync(LECTURES_DIR)) return null

  const files = fs.readdirSync(LECTURES_DIR).filter((f) => f.endsWith('.md'))

  for (const filename of files) {
    const number = extractNumber(filename)
    if (String(number) !== slug) continue

    const filePath = path.join(LECTURES_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(raw)
    return content
  }

  return null
}

// ─── Build chunk index for RAG ────────────────────────────────────────────────

/**
 * Split lecture content into overlapping paragraphs (~300-500 words each).
 * Keywords are extracted from the paragraph text for BM25-style scoring.
 */
export function buildLectureIndex(): LectureChunk[] {
  if (!fs.existsSync(LECTURES_DIR)) return []

  const files = fs.readdirSync(LECTURES_DIR).filter((f) => f.endsWith('.md'))
  const chunks: LectureChunk[] = []

  for (const filename of files) {
    const filePath = path.join(LECTURES_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(raw)
    const number = extractNumber(filename)
    const slug = String(number)
    const title = extractTitle(content)

    const paragraphs = splitIntoParagraphs(content)
    paragraphs.forEach((text, chunkIndex) => {
      chunks.push({
        lectureSlug: slug,
        lectureTitle: title,
        lectureNumber: number,
        chunkIndex,
        text,
        keywords: extractKeywords(text),
      })
    })
  }

  return chunks
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function splitIntoParagraphs(text: string): string[] {
  // Split on blank lines, keep chunks ≥ 50 chars
  const raw = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 50)

  // Merge very short adjacent chunks so we get ~300-500 word pieces
  const merged: string[] = []
  let current = ''

  for (const para of raw) {
    if ((current + ' ' + para).split(/\s+/).length < 400) {
      current = current ? current + '\n\n' + para : para
    } else {
      if (current) merged.push(current)
      current = para
    }
  }
  if (current) merged.push(current)

  return merged.length > 0 ? merged : [text.substring(0, 2000)]
}

const STOP_WORDS = new Set([
  'в', 'на', 'и', 'с', 'к', 'по', 'за', 'для', 'из', 'о', 'от',
  'не', 'но', 'или', 'что', 'как', 'так', 'это', 'то', 'а', 'же',
  'чем', 'при', 'со', 'до', 'бы', 'ли', 'уже', 'еще', 'вс', 'он',
  'она', 'они', 'мы', 'вы', 'я', 'их', 'его', 'её', 'нас', 'вас',
  'the', 'a', 'an', 'of', 'in', 'is', 'are', 'was', 'were',
])

export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яёA-ZА-ЯЁ0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 40)
}
