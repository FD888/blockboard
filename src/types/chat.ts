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
}

export type ChatAction = NavigateAction | QuizAction

// ─── API request / response ───────────────────────────────────────────────────

export interface ChatRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[]
  context?: {
    page: string          // e.g. '/', '/lectures', '/lectures/01-basics'
    lectureSlug?: string  // slug of the lecture currently being read
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
