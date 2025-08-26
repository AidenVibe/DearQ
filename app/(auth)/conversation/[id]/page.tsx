"use client"

import { ConversationPage as ConversationComponent } from '@/components/conversation-page'
import { useParams } from 'next/navigation'
import { dummyConversations, dummyFamilyMembers } from '@/lib/dummy-data'

export default function ConversationPage() {
  const params = useParams()
  const conversationId = params.id as string
  
  // 더미데이터에서 대화 찾기
  const conversation = dummyConversations.find(c => c.id === conversationId) || dummyConversations[0]
  const currentUser = dummyFamilyMembers[2] // 김민수 (아들)

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">대화 보기</h1>
        <p className="text-gray-600">
          "{conversation.question.content}" ({conversation.participantCount}명 참여)
        </p>
      </header>

      <ConversationComponent 
        conversation={conversation}
        currentUser={currentUser}
        onAddAnswer={(content: string) => {
          console.log('Adding answer:', content)
          // 실제로는 답변 추가 API 호출
        }}
      />
    </div>
  )
}