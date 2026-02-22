'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ChatMessage, ChatRequest, ChatResponse } from '@/types/chat'
import { ChatMessage as ChatMessageComponent, TypingIndicator } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { BotWallet } from './BotWallet'
import { readWallet } from '@/components/chat/QuizCard'

// ─── Quick actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: '🎯 Квиз на токен', prompt: 'Составь квиз из 4 вопросов по блокчейну, чтобы я мог получить токен' },
  { label: '🧠 Объясни ХК понятие', prompt: 'Хочу объяснить тебе понятие из блокчейна и получить токен. С чего начнём?' },
  { label: '⚡ Что такое консенсус?', prompt: 'Что такое консенсус-механизм? Объясни PoW и PoS' },
  { label: '💡 Зачем нужен блокчейн?', prompt: 'Какие реальные проблемы решает блокчейн в экономике?' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Hamster Комбат аватар ─────────────────────────────────────────────────────

function HKAvatar({ mood }: { mood: 'idle' | 'thinking' | 'happy' | 'excited' }) {
  const [imgError, setImgError] = useState(false)

  const frames =
    mood === 'excited' ? { y: [0, -10, 0, -10, 0], scale: [1, 1.15, 1, 1.15, 1] } :
    mood === 'thinking' ? { rotate: [-3, 3, -3], scale: [1, 1.03, 1] } :
    mood === 'happy' ? { y: [0, -6, 0], scale: [1, 1.08, 1] } :
    { y: [0, -3, 0] }

  const duration =
    mood === 'excited' ? 0.5 :
    mood === 'thinking' ? 1.2 :
    mood === 'happy' ? 0.8 : 3

  const ringColor =
    mood === 'excited' ? 'rgba(234,179,8,0.6)' :
    mood === 'happy' ? 'rgba(134,239,172,0.5)' :
    mood === 'thinking' ? 'rgba(147,207,189,0.4)' :
    'rgba(234,179,8,0.15)'

  const moodLabel =
    mood === 'idle' ? 'Жду вводных...' :
    mood === 'thinking' ? 'Думаю...' :
    mood === 'happy' ? 'Принято.' : 'Е-моё, молодец!'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <motion.div
          animate={frames}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-yellow-500/40 bg-yellow-500/10 shadow-lg shadow-yellow-500/10 overflow-hidden"
        >
          {!imgError ? (
            <img
              src="/images/hk-avatar.png"
              alt="Humster Комбат"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-5xl">🐹</span>
          )}
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          animate={{ borderColor: ringColor }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="text-center">
        <p className="text-base font-bold text-white">Humster Комбат</p>
        <p className="text-xs text-yellow-400/70">позывной «ХК» · курс молодого блокчейнера</p>
      </div>

      <motion.p
        key={mood}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-gray-500"
      >
        {moodLabel}
      </motion.p>
    </div>
  )
}

// ─── Stats bar ──────────────────────────────────────────────────────────────────

function StatsBar({ msgCount, coinCount }: { msgCount: number; coinCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-white/8 bg-white/3 p-3 text-center">
        <p className="text-lg font-bold text-white">{msgCount}</p>
        <p className="text-[10px] text-gray-500">вопросов</p>
      </div>
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
        <p className="text-lg font-bold text-yellow-300">{coinCount}</p>
        <p className="text-[10px] text-yellow-500/60">токенов</p>
      </div>
    </div>
  )
}

// ─── Main BotPage ──────────────────────────────────────────────────────────────

export function BotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mood, setMood] = useState<'idle' | 'thinking' | 'happy' | 'excited'>('idle')
  const [walletKey, setWalletKey] = useState(0)
  const [coinCount, setCoinCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'chat' | 'wallet'>('chat')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const userMsgCount = messages.filter((m) => m.role === 'user').length

  useEffect(() => {
    setCoinCount(readWallet().length)
  }, [walletKey])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'hk_wallet') setWalletKey((k) => k + 1)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return
      setError(null)
      setMood('thinking')

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
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          context: { page: pathname },
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data: ChatResponse = await res.json()

        if (!res.ok || data.error) {
          setError(data.error ?? 'Что-то пошло не так.')
          setMood('idle')
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

        if (data.action?.type === 'quiz' || data.action?.type === 'award_token') {
          setMood('excited')
          setTimeout(() => setMood('idle'), 3000)
          setTimeout(() => setWalletKey((k) => k + 1), 1000)
        } else {
          setMood('happy')
          setTimeout(() => setMood('idle'), 2000)
        }
      } catch {
        setError('Не удалось связаться с сервером. Проверь соединение.')
        setMood('idle')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, pathname],
  )

  const showQuickActions = messages.length === 0 && !isLoading

  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)]">

      {/* ── Сайдбар (desktop) ── */}
      <aside className="hidden w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r border-white/8 bg-[#0a0d1a] p-6 lg:flex">
        <HKAvatar mood={mood} />
        <div className="h-px bg-white/6" />
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Статистика</p>
          <StatsBar msgCount={userMsgCount} coinCount={coinCount} />
        </div>
        <div className="h-px bg-white/6" />
        <div className="flex-1 min-h-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Кошелёк</p>
          <BotWallet refreshKey={walletKey} />
        </div>
      </aside>

      {/* ── Основная область чата ── */}
      <main className="flex flex-1 flex-col overflow-hidden bg-[#0d1121]">

        {/* Мобильный хедер */}
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐹</span>
            <div>
              <p className="text-sm font-bold text-white">Humster Комбат</p>
              <p className="text-xs text-yellow-400/60">позывной «ХК»</p>
            </div>
          </div>
          <div className="flex rounded-lg border border-white/10 p-0.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${activeTab === 'chat' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Чат
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${activeTab === 'wallet' ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-500 hover:text-gray-300'}`}
            >
              🎒 {coinCount > 0 && <span className="ml-0.5 font-bold">{coinCount}</span>}
            </button>
          </div>
        </div>

        {/* Мобильный кошелёк */}
        {activeTab === 'wallet' && (
          <div className="flex-1 overflow-y-auto p-4 lg:hidden">
            <BotWallet refreshKey={walletKey} />
          </div>
        )}

        {/* Чат */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6 [scrollbar-width:thin]">

              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto max-w-md text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500/30 bg-yellow-500/10 overflow-hidden"
                    >
                      <img
                        src="/images/hk-avatar.png"
                        alt="ХК"
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                      <span className="text-4xl hidden">🐹</span>
                    </motion.div>
                  </div>
                  <h1 className="text-xl font-bold text-white">Humster Комбат, позывной «ХК»</h1>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    Прошёл все форки. Видел 51%-атаки. Теперь обучаю блокчейну.
                    Задай вопрос, пройди квиз или{' '}
                    <span className="text-yellow-400 font-medium">объясни мне понятие</span>{' '}
                    — заработай токен.
                  </p>
                </motion.div>
              )}

              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto grid max-w-lg grid-cols-2 gap-2"
                >
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.prompt)}
                      className="rounded-xl border border-white/8 bg-white/3 px-3 py-3 text-left text-xs text-gray-300 transition-all hover:border-yellow-500/30 hover:bg-yellow-500/5 hover:text-white"
                    >
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatMessageComponent key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>

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

            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => sendMessage(input)}
              disabled={isLoading}
              placeholder="Задай вопрос ХК или объясни ему понятие..."
            />
          </>
        )}
      </main>
    </div>
  )
}
