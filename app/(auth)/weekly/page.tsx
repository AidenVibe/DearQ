"use client"

import { WeeklyHighlight } from '@/components/weekly-highlight'

export default function WeeklyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">주간 하이라이트</h1>
        <p className="text-gray-600">
          이번 주 가족과 나눈 특별한 대화들을 카드로 만들어보세요
        </p>
      </header>

      <WeeklyHighlight />
    </div>
  )
}