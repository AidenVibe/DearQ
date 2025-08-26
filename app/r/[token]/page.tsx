"use client"

import { AnswerPage } from '@/components/answer-page'
import { useParams } from 'next/navigation'
import { dummyQuestions, dummyFamilyMembers } from '@/lib/dummy-data'

export default function ReceiveTokenPage() {
  const params = useParams()
  const token = params.token as string
  
  // 더미데이터: 토큰에 따른 질문 선택 (실제로는 토큰을 해석해서 가져옴)
  const question = token === 'sample' ? dummyQuestions[0] : dummyQuestions[1]
  const sender = dummyFamilyMembers[0] // 김아빠가 보낸 것으로 가정

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마음배달</h1>
          <p className="text-gray-600">
            {sender.name}님이 보낸 질문에 답변해주세요
          </p>
        </header>

        <AnswerPage 
          questionData={{ 
            question: question.content, 
            sender: sender.name,
            token: token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후
          }}
          onAnswerSubmitted={(conversationId: string) => {
            console.log('Answer submitted for conversation:', conversationId)
            // 실제로는 대화 보기 페이지로 이동하거나 성공 메시지 표시
          }}
        />
      </div>
    </div>
  )
}