'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { NavigateAction } from '@/types/chat'

interface LectureLinkProps {
  action: NavigateAction
}

export function LectureLink({ action }: LectureLinkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3"
    >
      <Link href={`/lectures/${action.slug}`}>
        <div className="group flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-all hover:border-primary/60 hover:bg-primary/10">
          {/* Block icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary">
            #{action.lectureNumber ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {action.title}
            </p>
            <p className="text-xs text-gray-400">Перейти к лекции →</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
