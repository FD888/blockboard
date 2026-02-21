import type { LectureChunk } from '@/types/chat'
import { extractKeywords } from './lectures'

/**
 * BM25-inspired keyword search over lecture chunks.
 * Returns the top-N most relevant chunks for a given query.
 * Works without embeddings – fast, free, zero external dependencies.
 */
export function searchChunks(
  query: string,
  chunks: LectureChunk[],
  topN = 5,
): LectureChunk[] {
  if (chunks.length === 0) return []

  const queryKeywords = extractKeywords(query)

  // Score each chunk by keyword overlap (TF-style)
  const scored = chunks.map((chunk) => {
    const chunkWords = chunk.keywords
    let score = 0

    for (const qw of queryKeywords) {
      // Exact match
      if (chunkWords.includes(qw)) {
        score += 2
        continue
      }
      // Partial / stem match (e.g. "консенсус" hits "консенсусного")
      for (const cw of chunkWords) {
        if (cw.startsWith(qw) || qw.startsWith(cw)) {
          score += 1
          break
        }
      }
    }

    // Boost: earlier lectures / lower chunk index to prefer introductory context
    const positionBonus = 1 / (1 + chunk.lectureNumber * 0.1 + chunk.chunkIndex * 0.05)

    return { chunk, score: score + positionBonus * 0.2 }
  })

  return scored
    .filter(({ score }) => score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ chunk }) => chunk)
}

/**
 * Format retrieved chunks into a concise context string for the LLM prompt.
 */
export function formatContext(chunks: LectureChunk[]): string {
  if (chunks.length === 0) return ''

  return chunks
    .map(
      (c) =>
        `[Лекция ${c.lectureNumber}: ${c.lectureTitle}]\n${c.text.trim()}`,
    )
    .join('\n\n---\n\n')
}
