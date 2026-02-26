'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { ChatMessage as ChatMessageType, AwardTokenAction } from '@/types/chat'
import { LectureLink } from './LectureLink'
import { QuizCard, saveHodlCoin } from './QuizCard'
import { LectureQuizPicker } from './LectureQuizPicker'

interface ChatMessageProps {
  message: ChatMessageType
  onSelectLecture?: (lectureNumber: number, lectureTitle: string) => void
}

// ─── Lightweight markdown renderer ────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []

  function flushList() {
    if (listItems.length === 0) return
    elements.push(
      <ul key={`ul-${elements.length}`} className="my-1 list-inside list-disc space-y-0.5 text-gray-300">
        {listItems.map((li, i) => <li key={i}>{renderInline(li)}</li>)}
      </ul>,
    )
    listItems = []
  }

  lines.forEach((line, i) => {
    if (/^[-*]\s/.test(line)) { listItems.push(line.replace(/^[-*]\s/, '')); return }
    flushList()
    if (line.trim() === '') {
      elements.push(<br key={i} />)
    } else if (/^#{1,3}\s/.test(line)) {
      elements.push(<p key={i} className="mt-2 font-semibold text-white">{renderInline(line.replace(/^#{1,3}\s/, ''))}</p>)
    } else {
      elements.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>)
    }
  })
  flushList()
  return elements
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (/^\*\*(.+)\*\*$/.test(part))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    if (/^`([^`]+)`$/.test(part))
      return <code key={i} className="rounded bg-white/10 px-1 font-mono text-xs text-secondary">{part.slice(1, -1)}</code>
    return part
  })
}

// ─── Token card (режим "Объясни ХК") ─────────────────────────────────────────

function TokenCard({ action }: { action: AwardTokenAction }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    saveHodlCoin({ coin: action.token, label: action.label, date: action.date })
    window.dispatchEvent(new StorageEvent('storage', { key: 'hk_wallet' }))
  }, [action.token, action.label, action.date])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(action.token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mt-3 rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-3"
    >
      <p className="mb-1 text-xs font-semibold text-yellow-300">
        🎖 Токен за объяснение · {action.concept}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 break-all rounded bg-black/30 px-2 py-1.5 font-mono text-xs text-yellow-200">
          {action.token}
        </code>
        <button
          onClick={handleCopy}
          title="Скопировать"
          className="shrink-0 rounded-lg border border-yellow-500/30 p-1.5 text-yellow-300 transition-colors hover:bg-yellow-500/20"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
          )}
        </button>
      </div>
      <p className="mt-1.5 text-[10px] text-yellow-300/50">
        Сохранено в кошелёк автоматически. Покажи преподавателю для зачёта.
      </p>
    </motion.div>
  )
}

// ─── Main message component ───────────────────────────────────────────────────

export function ChatMessage({ message, onSelectLecture }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mr-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/10 overflow-hidden text-xs">
          <img
            src="/images/hk-avatar.png"
            alt="ХК"
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = '' }}
          />
          <span style={{ display: 'none' }}>🐹</span>
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? '' : 'flex flex-col'}`}>
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-primary/80 px-3 py-2 text-sm text-white'
              : 'rounded-2xl rounded-tl-sm border border-white/8 bg-white/5 px-3 py-2 text-sm text-gray-300'
          }
        >
          {isUser ? message.content : (
            <div className="space-y-1">{renderMarkdown(message.content)}</div>
          )}
        </div>

        {!isUser && message.action?.type === 'navigate' && <LectureLink action={message.action} />}
        {!isUser && message.action?.type === 'quiz' && <QuizCard action={message.action} />}
        {!isUser && message.action?.type === 'award_token' && <TokenCard action={message.action} />}
        {!isUser && message.action?.type === 'lecture_quiz_select' && onSelectLecture && (
          <LectureQuizPicker onSelectLecture={onSelectLecture} />
        )}
      </div>
    </motion.div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2"
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/10 overflow-hidden text-xs">
        <img
          src="/images/hk-avatar.png"
          alt="ХК"
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = '' }}
        />
        <span style={{ display: 'none' }}>🐹</span>
      </div>
      <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-white/8 bg-white/5 px-3 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-gray-400"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  )
}
