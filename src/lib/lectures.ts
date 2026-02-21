import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { LectureMeta, LectureChunk } from '@/types/chat'

const LECTURES_DIR = path.join(process.cwd(), 'content', 'lectures')

// ─── Load all lecture metadata ────────────────────────────────────────────────

export function getLectureMetas(): LectureMeta[] {
  if (!fs.existsSync(LECTURES_DIR)) return []

  const files = fs.readdirSync(LECTURES_DIR).filter((f) => f.endsWith('.md'))

  return files
    .map((filename) => {
      const filePath = path.join(LECTURES_DIR, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(raw)
      const slug = filename.replace(/\.md$/, '')
      return {
        slug,
        title: data.title ?? slug,
        number: data.number ?? 0,
        date: data.date,
        summary: data.summary,
        keywords: data.keywords ?? [],
      } as LectureMeta
    })
    .sort((a, b) => a.number - b.number)
}

// ─── Load full lecture content ────────────────────────────────────────────────

export function getLectureContent(slug: string): string | null {
  const filePath = path.join(LECTURES_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content } = matter(raw)
  return content
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
    const { data, content } = matter(raw)
    const slug = filename.replace(/\.md$/, '')

    const paragraphs = splitIntoParagraphs(content)
    paragraphs.forEach((text, chunkIndex) => {
      chunks.push({
        lectureSlug: slug,
        lectureTitle: data.title ?? slug,
        lectureNumber: data.number ?? 0,
        chunkIndex,
        text,
        keywords: extractKeywords(text),
      })
    })
  }

  return chunks
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
