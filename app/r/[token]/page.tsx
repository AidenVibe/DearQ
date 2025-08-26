"use client"

import { AnswerPage } from '@/components/answer-page'
import { useParams } from 'next/navigation'

export default function ReceiveTokenPage() {
  const params = useParams()
  const token = params.token as string

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마음배달</h1>
          <p className="text-gray-600">
            가족이 보낸 질문에 답변해주세요
          </p>
        </header>

        <AnswerPage 
          token={token}
          onAnswerSubmitted={(conversationId) => {
            console.log('Answer submitted for conversation:', conversationId)
            // 실제로는 대화 보기 페이지로 이동하거나 성공 메시지 표시
          }}
        />
      </div>
    </div>
  )
}