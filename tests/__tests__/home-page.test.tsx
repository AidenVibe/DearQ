import { render, screen, fireEvent } from '@testing-library/react'
import { HomePage } from '@/components/home-page'

// TDD Red 단계 - 실패하는 테스트 작성
describe('HomePage', () => {
  it('오늘의 질문이 표시되어야 한다', () => {
    const mockQuestion = {
      id: 'daily_01',
      content: '최근 웃음이 났던 순간은 언제였나요?',
      category: '일상·하루' as const,
      date: '2025-08-25',
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    render(<HomePage todaysQuestion={mockQuestion} />)
    
    // 질문 내용 표시 확인
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.getByText('일상·하루')).toBeInTheDocument()
  })

  it('사용자 닉네임이 표시되어야 한다', () => {
    const mockUser = {
      id: 'user_123',
      nickname: '테스트사용자',
      profile_image: 'https://example.com/avatar.jpg'
    }
    
    const mockQuestion = {
      id: 'daily_01',
      content: '질문 내용',
      category: '일상·하루' as const,
      date: '2025-08-25',
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    render(<HomePage user={mockUser} todaysQuestion={mockQuestion} />)
    
    expect(screen.getByText('안녕하세요, 테스트사용자님!')).toBeInTheDocument()
  })

  it('3단계 스테퍼가 표시되어야 한다', () => {
    const mockQuestion = {
      id: 'daily_01',
      content: '질문 내용',
      category: '일상·하루' as const,
      date: '2025-08-25',
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    render(<HomePage todaysQuestion={mockQuestion} />)
    
    // 스테퍼 단계들 확인
    expect(screen.getByText('가족에게 보내기')).toBeInTheDocument()
    expect(screen.getByText('내 답변 작성하기')).toBeInTheDocument()
    expect(screen.getByText('대화 보기')).toBeInTheDocument()
  })

  it('보내기 버튼이 활성화되어야 한다', () => {
    const mockQuestion = {
      id: 'daily_01',
      content: '질문 내용',
      category: '일상·하루' as const,
      date: '2025-08-25',
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    render(<HomePage todaysQuestion={mockQuestion} />)
    
    const sendButton = screen.getByRole('button', { name: /보내기/i })
    expect(sendButton).toBeInTheDocument()
    expect(sendButton).not.toBeDisabled()
  })

  it('보내기 완료 후 상태가 업데이트되어야 한다', () => {
    const mockQuestion = {
      id: 'daily_01',
      content: '질문 내용',
      category: '일상·하루' as const,
      date: '2025-08-25',
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const mockOnSendComplete = jest.fn()
    
    render(
      <HomePage 
        todaysQuestion={mockQuestion} 
        onSendComplete={mockOnSendComplete}
        homeState={{ hasSent: true, hasAnswered: false, canViewConversation: false }}
      />
    )
    
    // 전송 완료 배지 확인
    expect(screen.getByText('전송 완료')).toBeInTheDocument()
    
    // 내 답변 쓰기 버튼이 활성화되어야 함
    const answerButton = screen.getByRole('button', { name: /내 답변 쓰기/i })
    expect(answerButton).toBeInTheDocument()
  })

  it('질문이 없을 때 적절한 메시지를 표시해야 한다', () => {
    render(<HomePage todaysQuestion={null} />)
    
    expect(screen.getByText(/오늘의 질문이 준비되지 않았어요/i)).toBeInTheDocument()
  })

  it('로딩 상태를 표시할 수 있어야 한다', () => {
    render(<HomePage isLoading={true} />)
    
    // 로딩 스켈레톤 또는 스피너 확인
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    const mockQuestion = {
      id: 'daily_01',
      content: '질문 내용',
      category: '일상·하루' as const,
      date: '2025-08-25',
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    render(<HomePage todaysQuestion={mockQuestion} />)
    
    const sendButton = screen.getByRole('button', { name: /보내기/i })
    expect(sendButton).toHaveClass(/min-h-\[44px\]/)
  })
})