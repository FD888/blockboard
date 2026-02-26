import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { NextRequest } from 'next/server'
import { getRagContext, buildSystemPrompt } from '@/lib/rag'
import { generateToken } from '@/lib/tokens'
import type { ChatRequest, ChatResponse, QuizQuestion } from '@/types/chat'

// ─── Rate limiting ────────────────────────────────────────────────────────────

const ipCounts = new Map<string, { count: number; resetAt: number }>()
const ipTokenAwards = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 15) return true
  entry.count++
  return false
}

/** Ограничение на выдачу токенов через чат: 3 в час с одного IP */
function isTokenAwardLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipTokenAwards.get(ip)
  if (!entry || now > entry.resetAt) {
    ipTokenAwards.set(ip, { count: 1, resetAt: now + 3_600_000 })
    return false
  }
  if (entry.count >= 3) return true
  entry.count++
  return false
}

// ─── Gemini tool definitions ──────────────────────────────────────────────────

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'navigate_to_lecture',
        description:
          'Направить студента на страницу конкретной лекции. Используй когда рекомендуешь изучить определённую лекцию.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            slug: { type: SchemaType.STRING, description: 'Slug лекции (имя файла без .md)' },
            title: { type: SchemaType.STRING, description: 'Название лекции' },
            lectureNumber: { type: SchemaType.NUMBER, description: 'Порядковый номер лекции' },
          },
          required: ['slug', 'title'],
        },
      },
      {
        name: 'generate_quiz',
        description:
          'Сгенерировать тестовые вопросы по конкретной лекции. Используй ТОЛЬКО когда студент явно просит проверить знания или пройти квиз по выбранной лекции. Всегда генерируй ровно 7 вопросов.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            topic: { type: SchemaType.STRING, description: 'Тема теста' },
            lectureNumber: { type: SchemaType.NUMBER, description: 'Номер лекции (2, 3 или 4)' },
            questions: {
              type: SchemaType.ARRAY,
              description: 'Ровно 7 вопросов с вариантами ответов',
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  question: { type: SchemaType.STRING },
                  options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  correct: { type: SchemaType.NUMBER, description: 'Индекс правильного ответа (0-based)' },
                  explanation: { type: SchemaType.STRING, description: 'Объяснение правильного ответа' },
                },
                required: ['question', 'options', 'correct', 'explanation'],
              },
            },
          },
          required: ['topic', 'lectureNumber', 'questions'],
        },
      },
      {
        name: 'award_token',
        description:
          'Выдать студенту токен за то, что он успешно объяснил понятие своими словами. ' +
          'Вызывай ТОЛЬКО в режиме "Объясни ХК" — когда студент дал полное и правильное объяснение, ' +
          'ты задал минимум один уточняющий вопрос и убедился в понимании. ' +
          'НЕ вызывай при частичном или неверном объяснении.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            concept: {
              type: SchemaType.STRING,
              description: 'Понятие, которое студент объяснил (2-5 слов, например "хэш-функция")',
            },
          },
          required: ['concept'],
        },
      },
    ],
  },
]

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(
  systemPrompt: string,
  messages: ChatRequest['messages'],
  ip: string,
): Promise<ChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // @ts-expect-error: tools type mismatch in SDK version
    tools: TOOLS,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  })

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const lastMessage = messages[messages.length - 1]
  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastMessage.content)
  const response = result.response

  const parts = response.candidates?.[0]?.content?.parts ?? []

  for (const part of parts) {
    if (!part.functionCall) continue
    const { name, args } = part.functionCall

    if (name === 'navigate_to_lecture') {
      const { slug, title, lectureNumber } = args as { slug: string; title: string; lectureNumber?: number }
      return {
        message: response.text() || `Рекомендую изучить лекцию «${title}».`,
        action: { type: 'navigate', slug, title, lectureNumber },
      }
    }

    if (name === 'generate_quiz') {
      const { topic, questions, lectureNumber } = args as { topic: string; questions: QuizQuestion[]; lectureNumber?: number }
      return {
        message: response.text() || `Вот тест по теме «${topic}»:`,
        action: { type: 'quiz', topic, questions, lectureNumber },
      }
    }

    if (name === 'award_token') {
      const { concept } = args as { concept: string }

      // Ограничение: не более 3 токенов в час через чат с одного IP
      if (isTokenAwardLimited(ip)) {
        return {
          message:
            'Е-моё. Лимит токенов через чат на сегодня исчерпан. ' +
            'Квизы на странице бота работают отдельно. Возвращайся позже.',
        }
      }

      const token = generateToken('explain')
      const label = `Объяснение · ${concept.trim()}`
      const date = new Date().toISOString().split('T')[0]

      return {
        message: response.text() || `Принято. Вот твой токен за объяснение понятия «${concept}». Сохрани.`,
        action: { type: 'award_token', token, label, date, concept },
      }
    }
  }

  return { message: response.text() }
}

// ─── Groq fallback ────────────────────────────────────────────────────────────

async function callGroq(
  systemPrompt: string,
  messages: ChatRequest['messages'],
): Promise<ChatResponse> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: groqMessages, max_tokens: 1024, temperature: 0.7 }),
  })

  if (!resp.ok) throw new Error(`Groq error ${resp.status}: ${await resp.text()}`)

  const data = await resp.json()
  return { message: data.choices?.[0]?.message?.content ?? '' }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Слишком много запросов. Подожди минуту.' },
      { status: 429 },
    )
  }

  let body: ChatRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Некорректный запрос.' }, { status: 400 })
  }

  const { messages, context } = body
  if (!messages?.length) {
    return Response.json({ error: 'Сообщения не переданы.' }, { status: 400 })
  }

  const lastUserMessage = messages.findLast((m) => m.role === 'user')?.content ?? ''
  const rag = getRagContext(lastUserMessage, context?.lectureSlug)
  const systemPrompt = buildSystemPrompt(rag, context?.page ?? '/')
  const trimmedMessages = messages.slice(-20)

  let result: ChatResponse
  try {
    result = await callGemini(systemPrompt, trimmedMessages, ip)
  } catch (geminiError) {
    console.error('Gemini failed:', geminiError)
    try {
      result = await callGroq(systemPrompt, trimmedMessages)
    } catch (groqError) {
      console.error('Groq also failed:', groqError)
      return Response.json({ error: 'Сервис временно недоступен. Попробуй позже.' }, { status: 503 })
    }
  }

  return Response.json(result)
}
