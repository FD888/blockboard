import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { NextRequest } from 'next/server'
import { getRagContext, buildSystemPrompt } from '@/lib/rag'
import type { ChatRequest, ChatResponse, QuizQuestion } from '@/types/chat'

// ─── Rate limiting (in-memory, resets per serverless invocation) ──────────────

const ipCounts = new Map<string, { count: number; resetAt: number }>()

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

// ─── Gemini tool definitions ──────────────────────────────────────────────────

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'navigate_to_lecture',
        description:
          'Направить пользователя на страницу конкретной лекции. Используй когда рекомендуешь пользователю изучить определённую лекцию.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            slug: {
              type: SchemaType.STRING,
              description: 'Slug лекции (имя файла без .md)',
            },
            title: {
              type: SchemaType.STRING,
              description: 'Человекочитаемое название лекции',
            },
            lectureNumber: {
              type: SchemaType.NUMBER,
              description: 'Порядковый номер лекции',
            },
          },
          required: ['slug', 'title'],
        },
      },
      {
        name: 'generate_quiz',
        description:
          'Сгенерировать тестовые вопросы для самопроверки. Используй только когда пользователь явно просит проверить знания или пройти тест.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            topic: {
              type: SchemaType.STRING,
              description: 'Тема теста',
            },
            questions: {
              type: SchemaType.ARRAY,
              description: 'Массив вопросов с вариантами ответов',
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  question: { type: SchemaType.STRING },
                  options: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                  },
                  correct: {
                    type: SchemaType.NUMBER,
                    description: 'Индекс правильного ответа (0-based)',
                  },
                  explanation: {
                    type: SchemaType.STRING,
                    description: 'Объяснение правильного ответа',
                  },
                },
                required: ['question', 'options', 'correct', 'explanation'],
              },
            },
          },
          required: ['topic', 'questions'],
        },
      },
    ],
  },
]

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(
  systemPrompt: string,
  messages: ChatRequest['messages'],
): Promise<ChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    // @ts-expect-error: tools type mismatch in SDK version
    tools: TOOLS,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  })

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const lastMessage = messages[messages.length - 1]
  const chat = model.startChat({ history })
  const result = await chat.sendMessage(lastMessage.content)
  const response = result.response

  // Check for function calls
  const candidate = response.candidates?.[0]
  const parts = candidate?.content?.parts ?? []

  for (const part of parts) {
    if (!part.functionCall) continue

    const { name, args } = part.functionCall

    if (name === 'navigate_to_lecture') {
      const { slug, title, lectureNumber } = args as {
        slug: string
        title: string
        lectureNumber?: number
      }
      const text = response.text()
      return {
        message: text || `Рекомендую изучить лекцию «${title}».`,
        action: { type: 'navigate', slug, title, lectureNumber },
      }
    }

    if (name === 'generate_quiz') {
      const { topic, questions } = args as {
        topic: string
        questions: QuizQuestion[]
      }
      const text = response.text()
      return {
        message: text || `Вот тест по теме «${topic}»:`,
        action: { type: 'quiz', topic, questions },
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
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Groq error ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  const message = data.choices?.[0]?.message?.content ?? ''
  return { message }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Слишком много запросов. Подожди минуту и попробуй снова.' },
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

  // RAG context
  const lastUserMessage =
    messages.findLast((m) => m.role === 'user')?.content ?? ''
  const rag = getRagContext(lastUserMessage, context?.lectureSlug)
  const systemPrompt = buildSystemPrompt(rag, context?.page ?? '/')

  // Trim history: keep last 10 exchanges to stay within token budget
  const trimmedMessages = messages.slice(-20)

  // Try Gemini first, fall back to Groq
  let result: ChatResponse
  try {
    result = await callGemini(systemPrompt, trimmedMessages)
  } catch (geminiError) {
    console.error('Gemini failed:', geminiError)
    try {
      result = await callGroq(systemPrompt, trimmedMessages)
    } catch (groqError) {
      console.error('Groq also failed:', groqError)
      return Response.json(
        {
          error:
            'Сервис временно недоступен. Попробуй позже.',
        },
        { status: 503 },
      )
    }
  }

  return Response.json(result)
}
