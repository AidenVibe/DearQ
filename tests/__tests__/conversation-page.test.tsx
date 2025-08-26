import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConversationPage } from '@/components/conversation-page'
import { Conversation, ConversationAnswer, SelfAnswerSubmission, SelfAnswerResponse } from '@/types/conversation'

// 테스트용 모의 대화 데이터
const mockConversation: Conversation = {
  id: 'conv_123',
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
}

const mockPartialConversation: Conversation = {
  ...mockConversation,
  answers: [mockConversation.answers[1]], // 상대방 답변만
  participants: [
    { id: 'user_sender', name: '테스트사용자', hasAnswered: false },
    { id: 'user_mom', name: '엄마', hasAnswered: true }
  ],
  status: 'active',
  canViewAll: false
}

// TDD Red 단계 - 실패하는 테스트 작성
describe('ConversationPage', () => {
  it('로딩 중일 때 스피너가 표시되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        isLoading={true}
      />
    )
    
    expect(screen.getByText(/대화를 불러오는 중/i)).toBeInTheDocument()
  })

  it('대화가 로드되면 질문 내용이 표시되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockConversation}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.getByText('일상·하루')).toBeInTheDocument()
    expect(screen.getByText('2025-08-25')).toBeInTheDocument()
  })

  it('완성된 대화에서 모든 답변이 표시되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockConversation}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('어제 고양이가 상자에 들어가려다 실패한 모습을 봤을 때였어요.')).toBeInTheDocument()
    expect(screen.getByText('아이가 처음 걸음마를 했을 때의 표정이 너무 귀여웠어요.')).toBeInTheDocument()
    expect(screen.getByText('테스트사용자')).toBeInTheDocument()
    expect(screen.getByText('엄마')).toBeInTheDocument()
  })

  it('자기 답변이 없을 때 자기표현 게이트가 활성화되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockPartialConversation}
        isLoading={false}
      />
    )
    
    expect(screen.getByText(/먼저 당신의 답변을 들려주세요/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/당신의 답변/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /답변 제출하기/i })).toBeInTheDocument()
  })

  it('자기표현 게이트에서 상대방 답변이 블러 처리되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockPartialConversation}
        isLoading={false}
      />
    )
    
    const blurredAnswer = screen.getByTestId('blurred-answer')
    expect(blurredAnswer).toHaveClass(/blur/)
    expect(screen.getAllByText(/답변을 작성하면 상대방의 답변을 볼 수 있어요/i).length).toBeGreaterThan(0)
  })

  it('자기 답변 제출 시 유효성 검증이 작동해야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockPartialConversation}
        isLoading={false}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /답변 제출하기/i })
    expect(submitButton).toBeDisabled()
    
    const answerInput = screen.getByLabelText(/당신의 답변/i)
    fireEvent.change(answerInput, { target: { value: '짧' } })
    expect(submitButton).toBeDisabled()
    
    fireEvent.change(answerInput, { target: { value: '충분히 긴 답변 내용입니다.' } })
    expect(submitButton).not.toBeDisabled()
  })

  it('자기 답변 제출 성공 시 축하 애니메이션이 표시되어야 한다', async () => {
    const mockOnSubmitAnswer = jest.fn().mockResolvedValue({
      answerId: 'answer_new',
      conversationId: 'conv_123',
      message: '답변이 추가되었어요!',
      unlockedAnswers: [mockConversation.answers[1]]
    })
    
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockPartialConversation}
        isLoading={false}
        onSubmitAnswer={mockOnSubmitAnswer}
      />
    )
    
    const answerInput = screen.getByLabelText(/당신의 답변/i)
    const submitButton = screen.getByRole('button', { name: /답변 제출하기/i })
    
    fireEvent.change(answerInput, { target: { value: '제 답변도 비슷해요. 재밌는 순간이었죠.' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('celebration-animation')).toBeInTheDocument()
      expect(screen.getByText(/대화가 연결되었어요!/i)).toBeInTheDocument()
    })
  })

  it('축하 애니메이션 후 전체 대화가 표시되어야 한다', async () => {
    const mockOnSubmitAnswer = jest.fn().mockResolvedValue({
      answerId: 'answer_new',
      conversationId: 'conv_123',
      message: '답변이 추가되었어요!',
      unlockedAnswers: [mockConversation.answers[1]]
    })
    
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockPartialConversation}
        isLoading={false}
        onSubmitAnswer={mockOnSubmitAnswer}
      />
    )
    
    const answerInput = screen.getByLabelText(/당신의 답변/i)
    const submitButton = screen.getByRole('button', { name: /답변 제출하기/i })
    
    fireEvent.change(answerInput, { target: { value: '제 답변도 비슷해요. 재밌는 순간이었죠.' } })
    fireEvent.click(submitButton)
    
    // 축하 애니메이션 대기
    await waitFor(() => {
      expect(screen.getByTestId('celebration-animation')).toBeInTheDocument()
    })
    
    // 애니메이션 완료 대기 (타이머 시뮬레이션)
    await waitFor(() => {
      expect(screen.queryByTestId('celebration-animation')).not.toBeInTheDocument()
    }, { timeout: 4000 })
    
    // 전체 대화 표시 - 애니메이션 완료 후 답변이 표시됨
    expect(screen.getAllByText('아이가 처음 걸음마를 했을 때의 표정이 너무 귀여웠어요.').length).toBeGreaterThan(0)
  })

  it('답변 제출 실패 시 에러 메시지가 표시되어야 한다', async () => {
    const mockOnSubmitAnswer = jest.fn().mockRejectedValue(new Error('답변 저장 실패'))
    
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockPartialConversation}
        isLoading={false}
        onSubmitAnswer={mockOnSubmitAnswer}
      />
    )
    
    const answerInput = screen.getByLabelText(/당신의 답변/i)
    const submitButton = screen.getByRole('button', { name: /답변 제출하기/i })
    
    fireEvent.change(answerInput, { target: { value: '제 답변도 비슷해요. 재밌는 순간이었죠.' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/답변 저장 중 문제가 발생했어요/i)).toBeInTheDocument()
    })
  })

  it('유효하지 않은 대화 ID일 때 에러 메시지가 표시되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="invalid_id"
        userId="user_sender"
        conversation={null}
        isLoading={false}
        error="존재하지 않는 대화예요."
      />
    )
    
    expect(screen.getByText(/존재하지 않는 대화예요/i)).toBeInTheDocument()
  })

  it('권한이 없는 대화일 때 접근 거부 메시지가 표시되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="unauthorized_user"
        conversation={null}
        isLoading={false}
        error="이 대화에 참여할 권한이 없어요."
      />
    )
    
    expect(screen.getByText(/이 대화에 참여할 권한이 없어요/i)).toBeInTheDocument()
  })

  it('자기 답변과 상대방 답변이 시각적으로 구분되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockConversation}
        isLoading={false}
      />
    )
    
    const ownAnswer = screen.getByTestId('answer-user_sender')
    const otherAnswer = screen.getByTestId('answer-user_mom')
    
    expect(ownAnswer).toHaveClass(/ml-8/)
    expect(otherAnswer).toHaveClass(/mr-8/)
  })

  it('답변이 시간순으로 정렬되어 표시되어야 한다', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockConversation}
        isLoading={false}
      />
    )
    
    const answerCards = screen.getAllByTestId(/^answer-/)
    expect(answerCards).toHaveLength(2)
    
    // 첫 번째 답변이 더 이른 시간 (10:30)
    expect(answerCards[0]).toHaveAttribute('data-testid', 'answer-user_sender')
    // 두 번째 답변이 더 늦은 시간 (11:15)  
    expect(answerCards[1]).toHaveAttribute('data-testid', 'answer-user_mom')
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    render(
      <ConversationPage 
        conversationId="conv_123"
        userId="user_sender"
        conversation={mockPartialConversation}
        isLoading={false}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /답변 제출하기/i })
    expect(submitButton).toHaveClass(/min-h-\[44px\]/)
  })
})