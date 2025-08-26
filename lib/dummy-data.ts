/**
 * 테스트용 더미데이터
 * 백엔드 구현 전까지 UI 테스트용으로 사용
 */

export interface Question {
  id: string
  content: string
  category: string
  createdAt: string
}

export interface FamilyMember {
  id: string
  name: string
  role: string
  avatar?: string
  joinedAt: string
  isActive: boolean
}

export interface Answer {
  id: string
  questionId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  isOwn: boolean
}

export interface Conversation {
  id: string
  questionId: string
  question: Question
  answers: Answer[]
  createdAt: string
  updatedAt: string
  participantCount: number
}

export interface WeeklyHighlight {
  id: string
  title: string
  description: string
  conversations: string[] // conversation IDs
  createdAt: string
  imageUrl?: string
}

// 더미 질문 데이터
export const dummyQuestions: Question[] = [
  {
    id: "q1",
    content: "어릴 때 가장 좋아했던 놀이는 무엇이었나요?",
    category: "추억",
    createdAt: "2025-08-26T09:00:00Z"
  },
  {
    id: "q2", 
    content: "가족과 함께 가고 싶은 여행지가 있다면?",
    category: "일상",
    createdAt: "2025-08-25T09:00:00Z"
  },
  {
    id: "q3",
    content: "최근에 가장 기뻤던 순간은 언제였나요?",
    category: "감정",
    createdAt: "2025-08-24T09:00:00Z"
  }
]

// 더미 가족 구성원 데이터
export const dummyFamilyMembers: FamilyMember[] = [
  {
    id: "user1",
    name: "김아빠",
    role: "아빠",
    avatar: "👨",
    joinedAt: "2025-08-01T00:00:00Z",
    isActive: true
  },
  {
    id: "user2", 
    name: "이엄마",
    role: "엄마",
    avatar: "👩",
    joinedAt: "2025-08-01T00:00:00Z",
    isActive: true
  },
  {
    id: "user3",
    name: "김민수",
    role: "아들",
    avatar: "👦",
    joinedAt: "2025-08-05T00:00:00Z",
    isActive: true
  },
  {
    id: "user4",
    name: "김지영",
    role: "딸",
    avatar: "👧", 
    joinedAt: "2025-08-10T00:00:00Z",
    isActive: false
  }
]

// 더미 답변 데이터
export const dummyAnswers: Answer[] = [
  {
    id: "a1",
    questionId: "q1",
    userId: "user1",
    userName: "김아빠",
    userAvatar: "👨",
    content: "저는 축구를 정말 좋아했어요. 동네 친구들과 함께 공터에서 축구하던 게 가장 재밌었죠.",
    createdAt: "2025-08-26T10:30:00Z",
    isOwn: false
  },
  {
    id: "a2",
    questionId: "q1", 
    userId: "user2",
    userName: "이엄마",
    userAvatar: "👩",
    content: "전 숨바꼭질이 좋았어요. 집 곳곳에 숨어있다가 찾아달라고 하는 게 재밌었어요.",
    createdAt: "2025-08-26T11:15:00Z",
    isOwn: false
  },
  {
    id: "a3",
    questionId: "q1",
    userId: "user3", 
    userName: "김민수",
    userAvatar: "👦",
    content: "저는 레고 조립이 제일 좋아요! 여러 가지 모양으로 만들 수 있어서 신나요.",
    createdAt: "2025-08-26T14:20:00Z",
    isOwn: true
  },
  {
    id: "a4",
    questionId: "q2",
    userId: "user1",
    userName: "김아빠", 
    userAvatar: "👨",
    content: "제주도에 가족 여행 가고 싶어요. 바다도 보고 맛있는 음식도 많이 먹고 싶어요.",
    createdAt: "2025-08-25T16:45:00Z",
    isOwn: false
  },
  {
    id: "a5",
    questionId: "q2",
    userId: "user2",
    userName: "이엄마",
    userAvatar: "👩", 
    content: "유럽 여행이 꿈이에요. 파리의 에펠탑도 보고, 이탈리아 음식도 먹어보고 싶어요.",
    createdAt: "2025-08-25T18:30:00Z",
    isOwn: false
  }
]

// 더미 대화 데이터
export const dummyConversations: Conversation[] = [
  {
    id: "conv1",
    questionId: "q1",
    question: dummyQuestions[0],
    answers: dummyAnswers.filter(a => a.questionId === "q1"),
    createdAt: "2025-08-26T09:00:00Z",
    updatedAt: "2025-08-26T14:20:00Z",
    participantCount: 3
  },
  {
    id: "conv2",
    questionId: "q2", 
    question: dummyQuestions[1],
    answers: dummyAnswers.filter(a => a.questionId === "q2"),
    createdAt: "2025-08-25T09:00:00Z",
    updatedAt: "2025-08-25T18:30:00Z",
    participantCount: 2
  },
  {
    id: "conv3",
    questionId: "q3",
    question: dummyQuestions[2],
    answers: [],
    createdAt: "2025-08-24T09:00:00Z", 
    updatedAt: "2025-08-24T09:00:00Z",
    participantCount: 0
  }
]

// 더미 주간 하이라이트 데이터
export const dummyWeeklyHighlights: WeeklyHighlight[] = [
  {
    id: "wh1",
    title: "이번 주 가족 대화 모음",
    description: "어린 시절 추억부터 여행 계획까지, 따뜻한 대화들을 모았어요",
    conversations: ["conv1", "conv2"],
    createdAt: "2025-08-26T00:00:00Z",
    imageUrl: undefined
  },
  {
    id: "wh2", 
    title: "지난주 베스트 대화",
    description: "가족의 소중한 순간들을 되돌아보는 시간이었어요",
    conversations: ["conv3"],
    createdAt: "2025-08-19T00:00:00Z",
    imageUrl: undefined
  }
]

// 오늘의 질문 (홈화면용)
export const getTodaysQuestion = (): Question => {
  return dummyQuestions[0]
}

// 사용자별 답변 통계
export const getUserStats = (userId: string) => {
  const userAnswers = dummyAnswers.filter(a => a.userId === userId)
  return {
    totalAnswers: userAnswers.length,
    thisWeekAnswers: userAnswers.filter(a => {
      const answerDate = new Date(a.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return answerDate >= weekAgo
    }).length,
    longestStreak: 5, // 더미 데이터
    currentStreak: 3   // 더미 데이터
  }
}

// 가족 활동 통계
export const getFamilyStats = () => {
  return {
    totalConversations: dummyConversations.length,
    activeMembers: dummyFamilyMembers.filter(m => m.isActive).length,
    totalMembers: dummyFamilyMembers.length,
    thisWeekConversations: 2,
    totalAnswers: dummyAnswers.length
  }
}