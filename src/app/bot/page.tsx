import type { Metadata } from 'next'
import { BotPage } from '@/components/bot/BotPage'

export const metadata: Metadata = {
  title: 'Humster Комбат — ХК | БлокБорд',
  description: 'Общайся с Humster Комбат (ХК) — обучайся блокчейну, проходи квизы и получай токены за знания.',
}

export default function BotRoute() {
  return <BotPage />
}
