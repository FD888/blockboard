'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ChatMessage, ChatRequest, ChatResponse } from '@/types/chat'
import { ChatMessage as ChatMessageComponent, TypingIndicator } from './ChatMessage'
import { ChatInput } from './ChatInput'

// ─── Quick action chips shown when the chat is empty ─────────────────────────

const QUICK_ACTIONS = [
  { label: '📖 Объясни тему', prompt: 'Объясни основные концепции блокчейна простыми словами' },
  { label: '🎯 Квиз на токен', prompt: 'Составь квиз из 3 вопросов по блокчейну, чтобы я мог получить токен' },
  { label: '🔍 Что такое консенсус?', prompt: 'Что такое консенсус в блокчейне и какие виды бывают?' },
  { label: '🧠 Объясни ХК понятие', prompt: 'Хочу объяснить тебе понятие из блокчейна и получить токен. С чего начнём?' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function getPageLabel(pathname: string): string {
  if (pathname === '/') return 'Главная'
  if (pathname.startsWith('/lectures/')) {
    const slug = pathname.replace('/lectures/', '')
    return `Лекция: ${slug}`
  }
  if (pathname === '/lectures') return 'Список лекций'
  if (pathname === '/glossary') return 'Глоссарий'
  return pathname
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const currentPage = getPageLabel(pathname)
  const lectureSlug = pathname.startsWith('/lectures/')
    ? pathname.replace('/lectures/', '')
    : undefined

  // Scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return
      setError(null)

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        const payload: ChatRequest = {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: { page: pathname, lectureSlug },
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data: ChatResponse = await res.json()

        if (!res.ok || data.error) {
          setError(data.error ?? 'Что-то пошло не так.')
          return
        }

        const botMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          action: data.action,
        }
        setMessages((prev) => [...prev, botMessage])
      } catch {
        setError('Не удалось связаться с сервером. Проверь соединение.')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, pathname, lectureSlug],
  )

  function handleSend() {
    sendMessage(input)
  }

  function handleQuickAction(prompt: string) {
    sendMessage(prompt)
  }

  const showQuickActions = messages.length === 0 && !isLoading

  // Bot page has its own full-screen chat — no need for floating widget there
  if (pathname === '/bot') return null

  return (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-50 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1121]/95 shadow-2xl shadow-black/40 backdrop-blur-md sm:right-6"
            style={{ height: 'min(520px, calc(100dvh - 7rem))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/10 text-lg">
                🐹
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Humster Комбат</p>
                <p className="truncate text-xs text-gray-500">
                  {currentPage}
                </p>
              </div>
              {/* Clear button */}
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="Очистить диалог"
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть чат"
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-width:thin]">
              {/* Welcome */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 text-2xl">
                    🐹
                  </div>
                  <p className="text-sm font-medium text-white">Humster Комбат, позывной «ХК»</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    Спрашивай про блокчейн, проходи квизы
                    и объясняй мне понятия — зарабатывай токены. 🎖
                  </p>
                </motion.div>
              )}

              {/* Quick actions */}
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="grid grid-cols-2 gap-2"
                >
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 text-left text-xs text-gray-300 transition-all hover:border-secondary/30 hover:bg-white/6 hover:text-white"
                    >
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Message list */}
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatMessageComponent key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Закрыть чат' : 'Открыть чат с Humster Комбат'}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-500/40 bg-[#0d1121] text-2xl shadow-lg shadow-black/40 transition-colors hover:border-yellow-500/60 sm:right-6"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base text-gray-400"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              🐹
            </motion.span>
          )}
        </AnimatePresence>

        {/* Notification pulse when messages exist */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute right-1 top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-400" />
          </span>
        )}
      </motion.button>
    </>
  )
}
