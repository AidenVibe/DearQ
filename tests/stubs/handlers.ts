import { http, HttpResponse } from 'msw'
import { flattenQuestions, getTodaysQuestion } from '@/lib/questions'
import questionsData from '@/data/questions.json'
import { FamilyLabel } from '@/types/label'
import { ReceivedQuestion, TokenValidation } from '@/types/answer'
import { Conversation, ConversationAnswer } from '@/types/conversation'

// MSW 핸들러 - 4가지 시나리오 (success, failure, expired, empty) 지원

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api'

// 질문 데이터 준비
const questions = flattenQuestions(questionsData)

// 테스트용 라벨 데이터
const mockLabels: FamilyLabel[] = [
  {
    id: 'label_mom',
    name: '엄마',
    nickname: '김영희',
    status: 'confirmed',
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2025-08-24'),
    isRecent: true,
    lastUsedAt: new Date('2025-08-24')
  },
  {
    id: 'label_dad',  
    name: '아빠',
    status: 'confirmed',
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2025-08-23'),
    isRecent: false,
    lastUsedAt: new Date('2025-08-23')
  },
  {
    id: 'label_sister',
    name: '누나',
    nickname: '김소희', 
    status: 'pending',
    createdAt: new Date('2025-08-22'),
    updatedAt: new Date('2025-08-24'),
    isRecent: true
  },
  {
    id: 'label_brother',
    name: '형',
    status: 'confirmed',
    createdAt: new Date('2025-08-21'),
    updatedAt: new Date('2025-08-21'),
    isRecent: false
  }
]

// 테스트용 수신 질문 데이터
const mockReceivedQuestions: Record<string, ReceivedQuestion> = {
  'valid_token_123': {
    id: 'daily_01',
    content: '최근 웃음이 났던 순간은 언제였나요?',
    category: '일상·하루',
    senderName: '테스트사용자',
    shareToken: 'valid_token_123',
    expiresAt: '2025-08-26T09:00:00.000Z',
    isExpired: false
  },
  'expired_token_456': {
    id: 'daily_02', 
    content: '가장 기억에 남는 여행지는 어디인가요?',
    category: '일상·하루',
    senderName: '테스트사용자',
    shareToken: 'expired_token_456',
    expiresAt: '2025-08-24T09:00:00.000Z',
    isExpired: true
  }
}

// 테스트용 대화 데이터
const mockConversations: Record<string, Conversation> = {
  'conv_complete': {
    id: 'conv_complete',
    question: {
      id: 'daily_01',
      content: '최근 웃음이 났던 순간은 언제였나요?',
      category: '일상·하루',
      date: '2025-08-25'
    },
    answers: [
      {
        id: 'answer_1',
        authorId: 'user_sender',
        authorName: '테스트사용자',
        content: '어제 고양이가 상자에 들어가려다 실패한 모습을 봤을 때였어요.',
        createdAt: '2025-08-25T10:30:00.000Z',
        isOwn: true
      },
      {
        id: 'answer_2',
        authorId: 'user_mom',
        authorName: '엄마',
        content: '아이가 처음 걸음마를 했을 때의 표정이 너무 귀여웠어요.',
        createdAt: '2025-08-25T11:15:00.000Z',
        isOwn: false
      }
    ],
    participants: [
      { id: 'user_sender', name: '테스트사용자', hasAnswered: true },
      { id: 'user_mom', name: '엄마', hasAnswered: true }
    ],
    status: 'completed',
    createdAt: '2025-08-25T09:00:00.000Z',
    updatedAt: '2025-08-25T11:15:00.000Z',
    canViewAll: true
  },
  'conv_partial': {
    id: 'conv_partial',
    question: {
      id: 'daily_02',
      content: '가장 기억에 남는 여행지는 어디인가요?',
      category: '일상·하루',
      date: '2025-08-25'
    },
    answers: [
      {
        id: 'answer_3',
        authorId: 'user_dad',
        authorName: '아빠',
        content: '제주도에서 가족과 함께한 시간이 가장 기억에 남아요.',
        createdAt: '2025-08-25T14:20:00.000Z',
        isOwn: false
      }
    ],
    participants: [
      { id: 'user_sender', name: '테스트사용자', hasAnswered: false },
      { id: 'user_dad', name: '아빠', hasAnswered: true }
    ],
    status: 'active',
    createdAt: '2025-08-25T13:00:00.000Z',
    updatedAt: '2025-08-25T14:20:00.000Z',
    canViewAll: false
  }
}

export const handlers = [
  // 카카오 로그인 - /api/auth/login
  http.post(`${API_BASE}/auth/login`, ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '로그인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '인증이 만료되었어요. 다시 로그인해주세요.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json(
          { error: '사용자 정보를 불러올 수 없어요.' },
          { status: 404 }
        )
      default: // success
        return HttpResponse.json({
          user: {
            id: 'user_123',
            nickname: '테스트사용자',
            profile_image: 'https://via.placeholder.com/40'
          },
          token: 'jwt_token_example',
          returnTo: url.searchParams.get('returnTo') || '/home'
        })
    }
  }),

  // 오늘의 질문 - /api/questions/today
  http.get(`${API_BASE}/questions/today`, ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '질문을 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json({
          question: null,
          message: '오늘의 질문이 준비되지 않았어요.'
        })
      default: // success
        const todaysQuestion = getTodaysQuestion(questions, date)
        return HttpResponse.json({
          question: todaysQuestion
        })
    }
  }),

  // 모든 질문 - /api/questions
  http.get(`${API_BASE}/questions`, ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const category = url.searchParams.get('category')
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '질문을 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json({
          questions: [],
          total: 0
        })
      default: // success
        let filteredQuestions = questions
        if (category) {
          filteredQuestions = questions.filter(q => q.category === category)
        }
        
        return HttpResponse.json({
          questions: filteredQuestions,
          total: filteredQuestions.length,
          categories: questionsData.categories.map(cat => ({
            category: cat.category,
            count: questions.filter(q => q.category === cat.category).length
          }))
        })
    }
  }),

  // 질문 검색 - /api/questions/search
  http.get(`${API_BASE}/questions/search`, ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const query = url.searchParams.get('q') || ''
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '검색 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json({
          questions: [],
          total: 0,
          query
        })
      default: // success
        const searchResults = questions.filter(question =>
          question.content.toLowerCase().includes(query.toLowerCase()) ||
          question.category.toLowerCase().includes(query.toLowerCase())
        )
        
        return HttpResponse.json({
          questions: searchResults,
          total: searchResults.length,
          query
        })
    }
  }),

  // 라벨 목록 조회 - /api/labels
  http.get(`${API_BASE}/labels`, ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '가족 정보를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json({
          labels: []
        })
      default: // success
        return HttpResponse.json({
          labels: mockLabels
        })
    }
  }),

  // 라벨 생성 - /api/labels
  http.post(`${API_BASE}/labels`, async ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '가족 추가 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json(
          { error: '입력 정보가 부족해요.' },
          { status: 400 }
        )
      default: // success
        const body = await request.json()
        const newLabel: FamilyLabel = {
          id: `label_${Date.now()}`,
          name: body.name,
          nickname: body.nickname,
          status: 'confirmed',
          createdAt: new Date(),
          updatedAt: new Date(),
          isRecent: true
        }
        return HttpResponse.json({
          label: newLabel
        }, { status: 201 })
    }
  }),

  // 라벨 수정 - /api/labels/:id
  http.put(`${API_BASE}/labels/:id`, async ({ request, params }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const labelId = params.id
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '가족 정보 수정 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json(
          { error: '존재하지 않는 가족이에요.' },
          { status: 404 }
        )
      default: // success
        const body = await request.json()
        const existingLabel = mockLabels.find(l => l.id === labelId)
        if (!existingLabel) {
          return HttpResponse.json(
            { error: '존재하지 않는 가족이에요.' },
            { status: 404 }
          )
        }
        
        const updatedLabel = {
          ...existingLabel,
          ...body,
          updatedAt: new Date()
        }
        
        return HttpResponse.json({
          label: updatedLabel
        })
    }
  }),

  // 라벨 삭제 - /api/labels/:id
  http.delete(`${API_BASE}/labels/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const labelId = params.id
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '가족 삭제 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json(
          { error: '존재하지 않는 가족이에요.' },
          { status: 404 }
        )
      default: // success
        return HttpResponse.json({
          message: '가족이 삭제되었어요.',
          deletedLabelId: labelId
        })
    }
  }),

  // 질문 보내기 - /api/send
  http.post(`${API_BASE}/send`, ({ request }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '전송 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json(
          { error: '보낼 대상을 찾을 수 없어요.' },
          { status: 404 }
        )
      default: // success
        return HttpResponse.json({
          shareToken: 'share_token_abc123',
          shareUrl: 'https://dearq.app/r/share_token_abc123',
          expiresAt: '2025-08-26T09:00:00.000Z',
          recipient: {
            labelId: 'label_mom',
            name: '엄마'
          }
        })
    }
  }),

  // 토큰 검증 및 질문 조회 - /api/receive/:token (GET)
  http.get(`${API_BASE}/receive/:token`, ({ request, params }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const token = params.token as string
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '토큰 검증 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { 
            status: 'expired',
            error: '링크 유효시간이 지났어요. 새 링크를 요청해주세요.' 
          },
          { status: 410 }
        )
      case 'empty':
        return HttpResponse.json(
          {
            status: 'invalid',
            error: '유효하지 않은 링크예요.'
          },
          { status: 404 }
        )
      default: // success
        const receivedQuestion = mockReceivedQuestions[token]
        if (!receivedQuestion) {
          return HttpResponse.json(
            {
              status: 'invalid',
              error: '유효하지 않은 링크예요.'
            },
            { status: 404 }
          )
        }
        
        if (receivedQuestion.isExpired) {
          return HttpResponse.json(
            {
              status: 'expired',
              error: '링크 유효시간이 지났어요. 새 링크를 요청해주세요.',
              question: receivedQuestion
            },
            { status: 410 }
          )
        }
        
        return HttpResponse.json({
          status: 'valid',
          question: receivedQuestion
        })
    }
  }),

  // 답변 제출 - /api/receive/:token (POST)
  http.post(`${API_BASE}/receive/:token`, ({ request, params }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const token = params.token
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '답변 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '링크 유효시간이 지났어요. 새 링크를 요청해주세요.' },
          { status: 410 }
        )
      case 'empty':
        return HttpResponse.json(
          { error: '유효하지 않은 링크예요.' },
          { status: 404 }
        )
      default: // success
        return HttpResponse.json({
          conversationId: 'conv_123',
          message: '답변이 전달되었어요! 대화를 확인해보세요.',
          canViewConversation: true
        })
    }
  }),

  // 대화 조회 - /api/conversations/:id
  http.get(`${API_BASE}/conversations/:id`, ({ request, params }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const conversationId = params.id
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '대화를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json({
          conversation: null,
          message: '아직 대화가 없어요. 오늘의 질문으로 시작해보세요.'
        })
      default: // success
        const conversation = mockConversations[conversationId as string]
        if (!conversation) {
          return HttpResponse.json(
            { error: '존재하지 않는 대화예요.' },
            { status: 404 }
          )
        }
        
        // 사용자 ID에 따라 isOwn 플래그 설정 (쿼리 파라미터에서 가져옴)
        const userId = url.searchParams.get('userId') || 'user_sender'
        const conversationWithUserContext = {
          ...conversation,
          answers: conversation.answers.map(answer => ({
            ...answer,
            isOwn: answer.authorId === userId
          }))
        }
        
        return HttpResponse.json({
          conversation: conversationWithUserContext
        })
    }
  }),

  // 자기 답변 추가 - /api/conversations/:id/answers
  http.post(`${API_BASE}/conversations/:id/answers`, async ({ request, params }) => {
    const url = new URL(request.url)
    const scenario = url.searchParams.get('scenario') || 'success'
    const conversationId = params.id as string
    
    switch (scenario) {
      case 'failure':
        return HttpResponse.json(
          { error: '답변 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        )
      case 'expired':
        return HttpResponse.json(
          { error: '로그인이 필요해요. 로그인 후 진행됩니다.' },
          { status: 401 }
        )
      case 'empty':
        return HttpResponse.json(
          { error: '존재하지 않는 대화예요.' },
          { status: 404 }
        )
      default: // success
        const body = await request.json()
        const conversation = mockConversations[conversationId]
        if (!conversation) {
          return HttpResponse.json(
            { error: '존재하지 않는 대화예요.' },
            { status: 404 }
          )
        }
        
        // 새로운 답변 생성
        const newAnswer: ConversationAnswer = {
          id: `answer_${Date.now()}`,
          authorId: body.authorId || 'user_sender',
          authorName: body.authorName,
          content: body.content,
          createdAt: new Date().toISOString(),
          isOwn: true
        }
        
        // 상대방 답변들 (자기표현 게이트 해제로 볼 수 있게 됨)
        const unlockedAnswers = conversation.answers.filter(answer => 
          answer.authorId !== (body.authorId || 'user_sender')
        )
        
        return HttpResponse.json({
          answerId: newAnswer.id,
          conversationId: conversationId,
          message: '답변이 추가되었어요! 대화를 확인해보세요.',
          unlockedAnswers: unlockedAnswers
        }, { status: 201 })
    }
  })
]