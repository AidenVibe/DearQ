"use client"

import { ConversationPage as ConversationComponent } from '@/components/conversation-page'
import { useParams } from 'next/navigation'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">대화 보기</h1>
        <p className="text-gray-600">
          가족과 나눈 소중한 대화를 확인하세요
        </p>
      </header>

      <ConversationComponent 
        conversationId={conversationId}
        onAddAnswer={(content) => {
          console.log('Adding answer:', content)
          // 실제로는 답변 추가 API 호출
        }}
      />
    </div>
  )
}