import type { Metadata } from 'next'
import { BotPage } from '@/components/bot/BotPage'

export const metadata: Metadata = {
  title: 'Ходлер — Хомяк-профессор | BlockBoard',
  description:
    'Общайся с Ходлером — ИИ-ассистентом BlockBoard. Задавай вопросы, проходи квизы и зарабатывай HODL-монетки за знания.',
}

export default function BotRoute() {
  return <BotPage />
}
