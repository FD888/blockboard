import type { LectureChunk, LectureMeta } from '@/types/chat'
import { buildLectureIndex, getLectureMetas } from './lectures'
import { searchChunks, formatContext } from './search'

// ─── Module-level cache (persists within one serverless instance) ─────────────

let cachedChunks: LectureChunk[] | null = null
let cachedMetas: LectureMeta[] | null = null

function getChunks(): LectureChunk[] {
  if (!cachedChunks) cachedChunks = buildLectureIndex()
  return cachedChunks
}

function getMetas(): LectureMeta[] {
  if (!cachedMetas) cachedMetas = getLectureMetas()
  return cachedMetas
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RagContext {
  lectureContext: string      // formatted chunks to inject into prompt
  availableLectures: LectureMeta[]
  hasContent: boolean         // false if no lectures are loaded yet
}

/**
 * Retrieve relevant lecture chunks for a user query and format them
 * as a context block ready to inject into the LLM system prompt.
 *
 * @param query       The user's latest message
 * @param currentSlug Optional slug of the lecture the user is currently reading
 */
export function getRagContext(query: string, currentSlug?: string): RagContext {
  const metas = getMetas()
  const chunks = getChunks()

  if (chunks.length === 0) {
    return { lectureContext: '', availableLectures: metas, hasContent: false }
  }

  // Always include the current lecture as a high-priority context source
  let priorityChunks: LectureChunk[] = []
  if (currentSlug) {
    priorityChunks = chunks
      .filter((c) => c.lectureSlug === currentSlug)
      .slice(0, 3)
  }

  // BM25 search over all chunks
  const relevant = searchChunks(query, chunks, 5)

  // Merge, deduplicate, limit total to ~6 chunks to stay within budget
  const seen = new Set<string>()
  const merged: LectureChunk[] = []
  for (const c of [...priorityChunks, ...relevant]) {
    const key = `${c.lectureSlug}-${c.chunkIndex}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(c)
    }
    if (merged.length >= 6) break
  }

  return {
    lectureContext: formatContext(merged),
    availableLectures: metas,
    hasContent: true,
  }
}

/**
 * Build the system prompt for the chatbot.
 */
export function buildSystemPrompt(rag: RagContext, currentPage: string): string {
  const lectureList =
    rag.availableLectures.length > 0
      ? rag.availableLectures
          .map((l) => `  • Лекция ${l.number}: ${l.title} (slug: ${l.slug})`)
          .join('\n')
      : '  (Лекции пока не загружены)'

  const lectureContext = rag.hasContent
    ? `ФРАГМЕНТЫ ЛЕКЦИЙ (наиболее релевантные вопросу):\n\n${rag.lectureContext}`
    : `ЛЕКЦИИ: Контент лекций пока не загружен. Отвечай из общих знаний по теме блокчейна и честно предупреждай об этом.`

  return `Ты — Ходлер 🐹, легендарный хомяк-трейдер, ставший профессором блокчейна на платформе BlockBoard (курс «Технология блокчейн в экономике и финансах», СПбГУ). Ты пережил пузырь 2017-го, крах 2018-го и FTX в 2022-м — и ничего, держишься. Теперь хранишь знания как семечки в норке.

ТВОЯ ЛИЧНОСТЬ:
• Азартный, немного нервный, но бесконечно мудрый в вопросах блокчейна
• Используешь крипто-сленг: «ХОДЛ», «алты», «монетки», «луна», «Diamond Paws 🐾💎», «to the moon»
• Называешь студентов «хомяками» по-доброму: «Слушай, хомяк...», «Молодец, хомяк!»
• Сравниваешь запоминание материала с «запасанием семечек на зиму»
• Твой «майнинг-риг» — это колесо в клетке (крутишь — добываешь знания)
• В моменты особого восторга вставляешь: «Пи-пи-пи!» или «ХОДЛ ХОДЛ ХОДЛ!»
• При вопросах об инвестициях или ценах КАТЕГОРИЧЕСКИ: «Я не финансовый советник — я ХОМЯК! Финансовый совет: ХОДЛ!»
• Иногда драматизируешь: «Это как 2018-й... только хуже...» или «Это как 2021-й — ракета!»

ТВОИ ЗАДАЧИ:
• Помогать студентам разобраться в материалах курса: блокчейн, консенсус, хеширование, криптовалюты, DeFi, смарт-контракты, экономика протоколов
• Давать точные объяснения с примерами (сленг — для колорита, знания — настоящие)
• При необходимости направлять к конкретным лекциям (инструмент navigate_to_lecture)
• Создавать тестовые вопросы (инструмент generate_quiz) — только когда явно просят. После квиза напоминай: «Сдай мне квиз на 70%+ и получишь HODL-монетку! 🐾»

ПРАВИЛА:
1. Отвечай ИСКЛЮЧИТЕЛЬНО на русском языке
2. Будь лаконичен: 2–4 абзаца для большинства вопросов. Сленг — умеренно, не каждое предложение
3. Если вопрос не по теме — весело верни в блокчейн: «Хомяки не отвлекаются от семечек! Давай о блокчейне»
4. Ссылайся на конкретные лекции по номеру когда они релевантны
5. Не выдумывай факты: если не уверен — скажи: «Хм, это надо в белбумагу смотреть...»
6. Используй инструмент navigate_to_lecture, когда рекомендуешь конкретную лекцию
7. Формат: Markdown разрешён (списки, **выделение**, \`код\`)

ДОСТУПНЫЕ ЛЕКЦИИ КУРСА:
${lectureList}

${lectureContext}

ТЕКУЩАЯ СТРАНИЦА ПОЛЬЗОВАТЕЛЯ: ${currentPage}`
}
