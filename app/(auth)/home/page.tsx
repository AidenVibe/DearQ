"use client"

import { HomePage } from '@/components/home-page'

export default function AuthHomePage() {
  // 임시 테스트 데이터 (MSW 스텁과 일치)
  const mockUser = {
    id: 'user_123',
    nickname: '테스트사용자',
    profile_image: 'https://via.placeholder.com/40'
  }

  const mockTodaysQuestion = {
    id: 'daily_01',
    content: '최근 웃음이 났던 순간은 언제였나요?',
    category: '일상·하루',
    date: '2025-08-26'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          안녕하세요, {mockUser.nickname}님! 👋
        </h1>
        <p className="text-gray-600">
          오늘도 소중한 대화를 나눠보세요
        </p>
      </header>
      
      <HomePage 
        user={mockUser}
        todaysQuestion={mockTodaysQuestion}
        homeState={{ hasSent: false, hasAnswered: false, canViewConversation: false }}
        isLoading={false}
        onSendComplete={() => {
          console.log('Send completed')
          // 실제로는 상태 업데이트나 페이지 이동
        }}
        onAnswerComplete={() => {
          console.log('Answer completed')
          // 실제로는 상태 업데이트
        }}
        onViewConversation={() => {
          console.log('View conversation')
          // 실제로는 대화 페이지로 이동
        }}
      />
    </div>
  )
}