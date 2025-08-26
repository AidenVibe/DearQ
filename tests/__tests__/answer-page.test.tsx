import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AnswerPage } from '@/components/answer-page'
import { ReceivedQuestion, TokenValidation } from '@/types/answer'

// 테스트용 모의 질문 데이터
const mockValidQuestion: ReceivedQuestion = {
  id: 'daily_01',
  content: '최근 웃음이 났던 순간은 언제였나요?',
  category: '일상·하루',
  senderName: '테스트사용자',
  shareToken: 'valid_token_123',
  expiresAt: '2025-08-26T09:00:00.000Z',
  isExpired: false
}

const mockExpiredQuestion: ReceivedQuestion = {
  ...mockValidQuestion,
  shareToken: 'expired_token_456',
  expiresAt: '2025-08-24T09:00:00.000Z',
  isExpired: true
}

// TDD Red 단계 - 실패하는 테스트 작성
describe('AnswerPage', () => {
  it('유효한 토큰일 때 질문이 표시되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.getByText('테스트사용자님이 보낸 질문')).toBeInTheDocument()
    expect(screen.getByText('일상·하루')).toBeInTheDocument()
  })

  it('답변 입력 폼이 표시되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    expect(screen.getByLabelText(/당신의 이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/답변을 작성해주세요/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /답변 보내기/i })).toBeInTheDocument()
  })

  it('초기에는 답변 보내기 버튼이 비활성화되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /답변 보내기/i })
    expect(submitButton).toBeDisabled()
  })

  it('이름과 답변을 모두 입력하면 버튼이 활성화되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    const nameInput = screen.getByLabelText(/당신의 이름/i)
    const answerTextarea = screen.getByLabelText(/답변을 작성해주세요/i)
    const submitButton = screen.getByRole('button', { name: /답변 보내기/i })
    
    fireEvent.change(nameInput, { target: { value: '엄마' } })
    fireEvent.change(answerTextarea, { target: { value: '어제 고양이가 상자에 들어가려다 실패한 모습을 봤을 때였어요.' } })
    
    expect(submitButton).not.toBeDisabled()
  })

  it('답변 길이가 2자 미만이면 에러 메시지가 표시되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    const answerTextarea = screen.getByLabelText(/답변을 작성해주세요/i)
    fireEvent.change(answerTextarea, { target: { value: '짧' } })
    fireEvent.blur(answerTextarea)
    
    expect(screen.getByText(/최소 2자 이상 작성해주세요/i)).toBeInTheDocument()
  })

  it('답변 길이가 800자일 때는 더 이상 입력되지 않아야 한다', () => {
    const maxAnswer = 'a'.repeat(800)
    const overAnswer = 'a'.repeat(801)
    
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    const answerTextarea = screen.getByLabelText(/답변을 작성해주세요/i) as HTMLTextAreaElement
    
    // 800자 입력은 가능
    fireEvent.change(answerTextarea, { target: { value: maxAnswer } })
    expect(answerTextarea.value).toBe(maxAnswer)
    expect(screen.getByText(/800\/800/)).toBeInTheDocument()
    
    // 801자 입력은 막힘 (800자에서 멈춤)
    fireEvent.change(answerTextarea, { target: { value: overAnswer } })
    expect(answerTextarea.value).toBe(maxAnswer) // 800자에서 멈춤
  })

  it('답변 제출 성공 시 성공 메시지가 표시되어야 한다', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue({
      conversationId: 'conv_123',
      message: '답변이 전달되었어요!',
      canViewConversation: true
    })
    
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
        onSubmit={mockOnSubmit}
      />
    )
    
    const nameInput = screen.getByLabelText(/당신의 이름/i)
    const answerTextarea = screen.getByLabelText(/답변을 작성해주세요/i)
    const submitButton = screen.getByRole('button', { name: /답변 보내기/i })
    
    fireEvent.change(nameInput, { target: { value: '엄마' } })
    fireEvent.change(answerTextarea, { target: { value: '어제 고양이가 상자에 들어가려다 실패한 모습을 봤을 때였어요.' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /답변이 전달되었어요!/i })).toBeInTheDocument()
    })
    
    expect(screen.getByRole('button', { name: /대화 보러가기/i })).toBeInTheDocument()
  })

  it('답변 제출 실패 시 에러 메시지가 표시되어야 한다', async () => {
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('답변 저장 실패'))
    
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
        onSubmit={mockOnSubmit}
      />
    )
    
    const nameInput = screen.getByLabelText(/당신의 이름/i)
    const answerTextarea = screen.getByLabelText(/답변을 작성해주세요/i)
    const submitButton = screen.getByRole('button', { name: /답변 보내기/i })
    
    fireEvent.change(nameInput, { target: { value: '엄마' } })
    fireEvent.change(answerTextarea, { target: { value: '어제 고양이가 상자에 들어가려다 실패한 모습을 봤을 때였어요.' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/답변 저장 중 문제가 발생했어요/i)).toBeInTheDocument()
    })
  })

  it('만료된 토큰일 때 만료 메시지가 표시되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="expired_token_456"
        question={mockExpiredQuestion}
        isLoading={false}
      />
    )
    
    expect(screen.getByText(/링크 유효시간이 지났어요/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/답변을 작성해주세요/i)).not.toBeInTheDocument()
  })

  it('유효하지 않은 토큰일 때 오류 메시지가 표시되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="invalid_token"
        question={null}
        isLoading={false}
        error="유효하지 않은 링크예요."
      />
    )
    
    expect(screen.getByRole('heading', { name: /유효하지 않은 링크예요/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/답변을 작성해주세요/i)).not.toBeInTheDocument()
  })

  it('로딩 중일 때 스피너가 표시되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={null}
        isLoading={true}
      />
    )
    
    expect(screen.getByText(/불러오는 중/i)).toBeInTheDocument()
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /답변 보내기/i })
    expect(submitButton).toHaveClass(/min-h-\[44px\]/)
  })

  it('글자 수 카운터가 표시되어야 한다', () => {
    render(
      <AnswerPage 
        shareToken="valid_token_123"
        question={mockValidQuestion}
        isLoading={false}
      />
    )
    
    const answerTextarea = screen.getByLabelText(/답변을 작성해주세요/i)
    fireEvent.change(answerTextarea, { target: { value: '테스트 답변입니다.' } })
    
    expect(screen.getByText(/10\/800/)).toBeInTheDocument()
  })
})