"use client"

import { WeeklyHighlightPage } from '@/components/weekly-highlight'
import { dummyWeeklyHighlights, dummyConversations } from '@/lib/dummy-data'

export default function WeeklyPage() {
  const highlights = dummyWeeklyHighlights
  const currentHighlight = highlights.length > 0 ? highlights[0] : null

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">주간 하이라이트</h1>
        <p className="text-gray-600">
          이번 주 가족과 나눈 특별한 대화들을 카드로 만들어보세요 ({highlights.length}개 하이라이트)
        </p>
      </header>

      <WeeklyHighlightPage 
        highlight={currentHighlight}
        isLoading={false}
        isEmpty={highlights.length === 0}
        availableWeeks={highlights.map(h => h.weekStart)}
      />
    </div>
  )
}