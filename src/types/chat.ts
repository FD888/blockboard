// ─── Message types ───────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  action?: ChatAction
}

// ─── Agentic actions ─────────────────────────────────────────────────────────

export interface NavigateAction {
  type: 'navigate'
  slug: string
  title: string
  lectureNumber?: number
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number // index of correct option
  explanation: string
}

export interface QuizAction {
  type: 'quiz'
  topic: string
  questions: QuizQuestion[]
  lectureNumber?: number
}

/** Выдаётся когда студент нажимает «Квиз на токен» — нужно выбрать лекцию */
export interface LectureQuizSelectAction {
  type: 'lecture_quiz_select'
}

/** Выдаётся ХК когда студент успешно объяснил понятие в режиме "Объясни ХК" */
export interface AwardTokenAction {
  type: 'award_token'
  token: string    // подписанный HK1-токен
  label: string    // человекочитаемое описание
  date: string     // ISO date string
  concept: string  // название понятия
}

export type ChatAction = NavigateAction | QuizAction | AwardTokenAction | LectureQuizSelectAction

// ─── API request / response ───────────────────────────────────────────────────

export interface ChatRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[]
  context?: {
    page: string
    lectureSlug?: string
  }
  /** Когда студент явно выбрал лекцию через пикер — генерировать квиз напрямую без рассуждений */
  directQuiz?: {
    lectureNumber: number
    lectureTitle: string
  }
}

export interface ChatResponse {
  message: string
  action?: ChatAction
  error?: string
}

// ─── Lecture index (search) ──────────────────────────────────────────────────

export interface LectureChunk {
  lectureSlug: string
  lectureTitle: string
  lectureNumber: number
  chunkIndex: number
  text: string
  keywords: string[]
}

export interface LectureMeta {
  slug: string
  title: string
  number: number
  date?: string
  summary?: string
  keywords?: string[]
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface HodlCoin {
  coin: string   // HK1-токен
  label: string  // «Квиз (90%) · Тема» или «Объяснение · Понятие»
  date: string   // ISO date string
}
