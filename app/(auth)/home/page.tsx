"use client"

import { HomePage } from '@/components/home-page'
import { getTodaysQuestion, dummyFamilyMembers, getUserStats, getFamilyStats } from '@/lib/dummy-data'

export default function AuthHomePage() {
  // 더미데이터 사용
  const currentUser = dummyFamilyMembers[2] // 김민수 (아들)
  const todaysQuestion = getTodaysQuestion()
  const userStats = getUserStats(currentUser.id)
  const familyStats = getFamilyStats()

  const mockUser = {
    id: currentUser.id,
    nickname: currentUser.name,
    profile_image: currentUser.avatar
  }

  const mockTodaysQuestion = {
    id: todaysQuestion.id,
    content: todaysQuestion.content,
    category: todaysQuestion.category,
    date: new Date(todaysQuestion.createdAt).toISOString().split('T')[0]
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