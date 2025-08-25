export interface User {
  id: string
  kakaoUserId: string
  nickname: string
  createdAt: string
}

export interface Label {
  labelId: string
  senderUserId: string
  name: string
  createdAt: string
  blocked: boolean
}

export interface LabelBinding {
  senderUserId: string
  labelId: string
  recipientUserId: string
  status: "pending" | "confirmed" | "blocked" | "archived"
  lastUsedAt: string
  recipientNickname?: string
}

export interface Question {
  id: string
  content: string
  category: string
  createdAt: string
}

export interface SendEvent {
  sendId: string
  senderUserId: string
  labelId: string
  token: string
  expiresAt: string
  createdAt: string
  questionId: string
}

export interface Answer {
  answerId: string
  sendId: string
  authorUserId: string
  content: string
  answeredAt: string
}

export interface Conversation {
  conversationId: string
  sendId: string
  senderAnswerId?: string
  recipientAnswerId?: string
  question: Question
  senderAnswer?: Answer
  recipientAnswer?: Answer
  labelName: string
  createdAt: string
}

// Dummy data
export const currentUser: User = {
  id: "user-1",
  kakaoUserId: "kakao-123",
  nickname: "김민수",
  createdAt: "2024-01-01T00:00:00Z",
}

export const todaysQuestion: Question = {
  id: "q-1",
  content: "오늘 하루 중 가장 기억에 남는 순간은 언제였나요?",
  category: "일상",
  createdAt: "2024-08-25T00:00:00Z",
}

export const labels: Label[] = [
  {
    labelId: "label-1",
    senderUserId: "user-1",
    name: "엄마",
    createdAt: "2024-01-01T00:00:00Z",
    blocked: false,
  },
  {
    labelId: "label-2",
    senderUserId: "user-1",
    name: "아빠",
    createdAt: "2024-01-02T00:00:00Z",
    blocked: false,
  },
  {
    labelId: "label-3",
    senderUserId: "user-1",
    name: "할머니",
    createdAt: "2024-01-03T00:00:00Z",
    blocked: false,
  },
  {
    labelId: "label-4",
    senderUserId: "user-1",
    name: "형",
    createdAt: "2024-01-04T00:00:00Z",
    blocked: false,
  },
]

export const labelBindings: LabelBinding[] = [
  {
    senderUserId: "user-1",
    labelId: "label-1",
    recipientUserId: "user-2",
    status: "confirmed",
    lastUsedAt: "2024-08-24T00:00:00Z",
    recipientNickname: "이영희",
  },
  {
    senderUserId: "user-1",
    labelId: "label-2",
    recipientUserId: "user-3",
    status: "confirmed",
    lastUsedAt: "2024-08-23T00:00:00Z",
    recipientNickname: "김철수",
  },
]

export const conversations: Conversation[] = [
  {
    conversationId: "conv-1",
    sendId: "send-1",
    senderAnswerId: "answer-1",
    recipientAnswerId: "answer-2",
    question: {
      id: "q-past-1",
      content: "어릴 때 가장 좋아했던 놀이는 무엇이었나요?",
      category: "추억",
      createdAt: "2024-08-24T00:00:00Z",
    },
    senderAnswer: {
      answerId: "answer-1",
      sendId: "send-1",
      authorUserId: "user-1",
      content: "저는 숨바꼭질을 정말 좋아했어요. 특히 집 안 곳곳에 숨어서 찾아달라고 하는 게 재밌었던 것 같아요.",
      answeredAt: "2024-08-24T10:30:00Z",
    },
    recipientAnswer: {
      answerId: "answer-2",
      sendId: "send-1",
      authorUserId: "user-2",
      content: "나도 숨바꼭질 좋아했지! 너랑 같이 놀던 게 엊그제 같은데... 그때는 정말 순수했구나.",
      answeredAt: "2024-08-24T14:20:00Z",
    },
    labelName: "엄마",
    createdAt: "2024-08-24T00:00:00Z",
  },
  {
    conversationId: "conv-2",
    sendId: "send-2",
    senderAnswerId: "answer-3",
    recipientAnswerId: "answer-4",
    question: {
      id: "q-past-2",
      content: "최근에 새로 배운 것이 있다면 무엇인가요?",
      category: "성장",
      createdAt: "2024-08-23T00:00:00Z",
    },
    senderAnswer: {
      answerId: "answer-3",
      sendId: "send-2",
      authorUserId: "user-1",
      content: "요즘 기타를 배우고 있어요. 아직 서툴지만 간단한 코드는 칠 수 있게 되었어요.",
      answeredAt: "2024-08-23T09:15:00Z",
    },
    recipientAnswer: {
      answerId: "answer-4",
      sendId: "send-2",
      authorUserId: "user-3",
      content: "오, 기타라니! 아빠도 젊을 때 기타 쳤었는데... 나중에 같이 연주해보자.",
      answeredAt: "2024-08-23T18:45:00Z",
    },
    labelName: "아빠",
    createdAt: "2024-08-23T00:00:00Z",
  },
]
