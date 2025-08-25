import { http, HttpResponse } from 'msw'

// MSW 핸들러 - 4가지 시나리오 (success, failure, expired, empty) 지원

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api'

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
        return HttpResponse.json({
          question: {
            id: 'q_20250825',
            content: '최근 웃음이 났던 순간은 언제였나요?',
            category: '일상·하루',
            date: '2025-08-25'
          }
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
          token: 'share_token_abc123',
          shareUrl: 'https://dearq.app/r/share_token_abc123',
          expiresAt: '2025-08-26T09:00:00.000Z',
          receiver: {
            label: '엄마',
            id: 'label_mom'
          }
        })
    }
  }),

  // 답변 제출 - /api/receive/:token
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
        return HttpResponse.json({
          conversation: {
            id: conversationId,
            question: {
              content: '최근 웃음이 났던 순간은 언제였나요?',
              category: '일상·하루'
            },
            answers: [
              {
                author: '테스트사용자',
                content: '어제 고양이가 상자에 들어가려다 실패한 모습을 봤을 때였어요.',
                createdAt: '2025-08-25T10:30:00.000Z'
              },
              {
                author: '엄마',
                content: '아이가 처음 걸음마를 했을 때의 표정이 너무 귀여웠어요.',
                createdAt: '2025-08-25T11:15:00.000Z'
              }
            ],
            canViewAll: true,
            createdAt: '2025-08-25T09:00:00.000Z'
          }
        })
    }
  })
]