'use client'

import { motion } from 'framer-motion'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { LectureLink } from './LectureLink'
import { QuizCard } from './QuizCard'

interface ChatMessageProps {
  message: ChatMessageType
}

// Very lightweight markdown → JSX renderer (handles bold, inline-code, lists)
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []

  function flushList() {
    if (listItems.length === 0) return
    elements.push(
      <ul key={`ul-${elements.length}`} className="my-1 list-inside list-disc space-y-0.5 text-gray-300">
        {listItems.map((li, i) => (
          <li key={i}>{renderInline(li)}</li>
        ))}
      </ul>,
    )
    listItems = []
  }

  lines.forEach((line, i) => {
    if (/^[-*]\s/.test(line)) {
      listItems.push(line.replace(/^[-*]\s/, ''))
      return
    }
    flushList()

    if (line.trim() === '') {
      elements.push(<br key={i} />)
    } else if (/^#{1,3}\s/.test(line)) {
      elements.push(
        <p key={i} className="mt-2 font-semibold text-white">
          {renderInline(line.replace(/^#{1,3}\s/, ''))}
        </p>,
      )
    } else {
      elements.push(
        <p key={i} className="leading-relaxed">
          {renderInline(line)}
        </p>,
      )
    }
  })
  flushList()
  return elements
}

function renderInline(text: string): React.ReactNode[] {
  // Handle **bold**, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (/^\*\*(.+)\*\*$/.test(part)) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (/^`([^`]+)`$/.test(part)) {
      return (
        <code
          key={i}
          className="rounded bg-white/10 px-1 font-mono text-xs text-secondary"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="mr-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/10 text-xs">
          🐹
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? '' : 'flex flex-col'}`}>
        {/* Bubble */}
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-primary/80 px-3 py-2 text-sm text-white'
              : 'rounded-2xl rounded-tl-sm border border-white/8 bg-white/5 px-3 py-2 text-sm text-gray-300'
          }
        >
          {isUser ? (
            message.content
          ) : (
            <div className="space-y-1">{renderMarkdown(message.content)}</div>
          )}
        </div>

        {/* Agentic action UI */}
        {!isUser && message.action?.type === 'navigate' && (
          <LectureLink action={message.action} />
        )}
        {!isUser && message.action?.type === 'quiz' && (
          <QuizCard action={message.action} />
        )}
      </div>
    </motion.div>
  )
}

// Typing indicator shown while waiting for a response
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2"
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/10 text-xs">
        🐹
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
