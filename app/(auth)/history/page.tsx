"use client"

import { ConversationHistory } from '@/components/conversation-history'

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">대화 히스토리</h1>
        <p className="text-gray-600">
          가족과 나눈 소중한 대화들을 다시 읽어보세요
        </p>
      </header>

      <ConversationHistory />
    </div>
  )
}