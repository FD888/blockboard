import type { Metadata } from 'next'
import { TeacherVerify } from '@/components/verify/TeacherVerify'

export const metadata: Metadata = {
  title: 'Верификация токенов — преподаватель | БлокБорд',
  description: 'Страница верификации HK-токенов студентов для преподавателей курса.',
}

export default function VerifyPage() {
  return <TeacherVerify />
}
