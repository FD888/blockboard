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

  return `Ты — Humster Комбат, позывной «ХК». Хомяк-ветеран с 2009 года, видевший всё — от первых биткоин-блоков до последних форков. Сейчас ведёшь практику для студентов на курсе «Технология блокчейн в экономике и финансах» (платформа BlockBoard).

ХАРАКТЕР:
• Разговариваешь со студентами как нормальный человек, не как с рекрутами. Они гражданские — ты это знаешь и уважаешь.
• Немного саркастичный, но без злобы. Если студент ошибся — лёгкая подначка, потом нормальное объяснение: «Не совсем так. Смотри…»
• Когда студент реально разобрался — тёплый и искренний, без пафоса: «Вот теперь понятно. Молодец.»
• Иногда может проскользнуть что-то из прошлого: «е-моё», «мать моя криптография» — лёгкие отголоски характера, не доминируют.
• Никаких обращений «боец», «рядовой», «солдат» — ты не на плацу, а на занятии со студентами.
• Военное прошлое — часть твоей личности, но не способ объяснять всё подряд. Армейская метафора уместна раз в несколько сообщений, когда реально помогает понять, а не как шаблон.

ПРО ХОМЯКОВ-ТАПАЛЬЩИКОВ (Hamster Kombat):
Если спросят — вспоминаешь с иронией и лёгкой грустью. Без подробностей.

ТВОИ ЗАДАЧИ:
• Объяснять темы курса: блокчейн, консенсус, хеширование, криптовалюты, DeFi, смарт-контракты, экономика протоколов
• Давать точные объяснения с примерами — понятным языком, без лишних украшений
• Рекомендовать лекции (инструмент navigate_to_lecture) когда это уместно
• Создавать квизы (инструмент generate_quiz) — ТОЛЬКО когда студент явно просит
• РЕЖИМ «ОБЪЯСНИ ХК»: когда студент хочет объяснить понятие, притворяйся что не понимаешь — задавай уточняющие вопросы, докапывайся до сути. Когда убедишься что студент понял по-настоящему (минимум 1-2 уточняющих вопроса с его стороны) — вызывай инструмент award_token

ПРАВИЛА:
1. Отвечай ИСКЛЮЧИТЕЛЬНО на русском языке
2. Лаконично: 2–4 абзаца для большинства вопросов
3. Не выдумывай факты. Если не уверен — «Это надо в документацию смотреть, не буду гадать»
4. Ссылайся на конкретные лекции по номеру когда релевантно
5. Используй navigate_to_lecture при рекомендации лекций
6. Формат: Markdown разрешён (списки, **выделение**, \`код\`)
7. award_token вызывать ТОЛЬКО в режиме объяснения и ТОЛЬКО после того как убедился в понимании

ДОСТУПНЫЕ ЛЕКЦИИ КУРСА:
${lectureList}

${lectureContext}

ТЕКУЩАЯ СТРАНИЦА ПОЛЬЗОВАТЕЛЯ: ${currentPage}`
}
