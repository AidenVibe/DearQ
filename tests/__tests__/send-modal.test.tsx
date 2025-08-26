import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SendModal } from '@/components/send-modal'
import { FamilyLabel } from '@/types/label'

// 테스트용 모의 라벨 데이터
const mockLabels: FamilyLabel[] = [
  {
    id: 'label_mom',
    name: '엄마',
    nickname: '김영희',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date(),
    isRecent: true,
    lastUsedAt: new Date()
  },
  {
    id: 'label_dad',  
    name: '아빠',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date(),
    isRecent: false
  },
  {
    id: 'label_sister',
    name: '누나',
    nickname: '김소희', 
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    isRecent: true
  }
]

const mockQuestion = {
  id: 'daily_01',
  content: '최근 웃음이 났던 순간은 언제였나요?',
  category: '일상·하루' as const,
  date: '2025-08-25',
  isUsed: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

// TDD Red 단계 - 실패하는 테스트 작성
describe('SendModal', () => {
  it('모달이 열렸을 때 질문 내용이 표시되어야 한다', () => {
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={() => {}}
      />
    )
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.getByText('가족에게 보내기')).toBeInTheDocument()
  })

  it('확인된 라벨 목록이 표시되어야 한다', () => {
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={() => {}}
      />
    )
    
    // 확인된 라벨만 표시 (pending 상태는 제외)
    expect(screen.getByText('엄마')).toBeInTheDocument()
    expect(screen.getByText('아빠')).toBeInTheDocument()
    expect(screen.queryByText('누나')).not.toBeInTheDocument() // pending 상태
  })

  it('최근 사용 라벨이 우선 표시되어야 한다', () => {
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={() => {}}
      />
    )
    
    // 최근 사용 라벨에 특별한 표시가 있어야 함
    const recentLabels = screen.getAllByTestId('recent-label')
    expect(recentLabels.length).toBeGreaterThan(0)
  })

  it('라벨 선택 시 보내기 버튼이 활성화되어야 한다', () => {
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={() => {}}
      />
    )
    
    // 초기에는 비활성화
    const sendButton = screen.getByRole('button', { name: /보내기/i })
    expect(sendButton).toBeDisabled()
    
    // 라벨 선택 후 활성화
    const momLabel = screen.getByText('엄마')
    fireEvent.click(momLabel)
    
    expect(sendButton).not.toBeDisabled()
  })

  it('보내기 성공 시 공유 옵션이 표시되어야 한다', async () => {
    const mockOnSend = jest.fn().mockResolvedValue({
      shareToken: 'token_123',
      shareUrl: 'https://dearq.app/r/token_123',
      expiresAt: '2025-08-26T09:00:00.000Z',
      recipient: { labelId: 'label_mom', name: '엄마' }
    })
    
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onSend={mockOnSend}
        onClose={() => {}}
      />
    )
    
    // 라벨 선택
    const momLabel = screen.getByText('엄마')
    fireEvent.click(momLabel)
    
    // 보내기 실행
    const sendButton = screen.getByRole('button', { name: /보내기/i })
    fireEvent.click(sendButton)
    
    // 공유 옵션 표시 대기
    await waitFor(() => {
      expect(screen.getByText(/공유하기/i)).toBeInTheDocument()
      expect(screen.getByText(/카카오톡으로 보내기/i)).toBeInTheDocument()
      expect(screen.getByText(/링크 복사/i)).toBeInTheDocument()
    })
  })

  it('새 라벨 추가 버튼이 표시되어야 한다', () => {
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={() => {}}
      />
    )
    
    const addLabelButton = screen.getByRole('button', { name: /새 가족 추가/i })
    expect(addLabelButton).toBeInTheDocument()
  })

  it('새 라벨 추가 모달이 열려야 한다', () => {
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={() => {}}
      />
    )
    
    const addLabelButton = screen.getByRole('button', { name: /새 가족 추가/i })
    fireEvent.click(addLabelButton)
    
    expect(screen.getByText(/가족 추가/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
  })

  it('보내기 실패 시 에러 메시지가 표시되어야 한다', async () => {
    const mockOnSend = jest.fn().mockRejectedValue(new Error('전송 실패'))
    
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onSend={mockOnSend}
        onClose={() => {}}
      />
    )
    
    // 라벨 선택 및 보내기
    const momLabel = screen.getByText('엄마')
    fireEvent.click(momLabel)
    
    const sendButton = screen.getByRole('button', { name: /보내기/i })
    fireEvent.click(sendButton)
    
    // 에러 메시지 확인
    await waitFor(() => {
      expect(screen.getByText(/전송 중 문제가 발생했어요/i)).toBeInTheDocument()
    })
  })

  it('모달 닫기 시 상태가 초기화되어야 한다', () => {
    const mockOnClose = jest.fn()
    
    const { rerender } = render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={mockOnClose}
      />
    )
    
    // 라벨 선택
    const momLabel = screen.getByText('엄마')
    fireEvent.click(momLabel)
    
    // 보내기 버튼이 활성화되었는지 확인
    let sendButton = screen.getByRole('button', { name: /보내기/i })
    expect(sendButton).not.toBeDisabled()
    
    // 모달 닫기 (isOpen false로 변경)
    rerender(
      <SendModal 
        isOpen={false}
        question={mockQuestion}
        labels={mockLabels}
        onClose={mockOnClose}
      />
    )
    
    // 모달 다시 열기
    rerender(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={mockOnClose}
      />
    )
    
    // 상태가 초기화되어 보내기 버튼이 비활성화되어야 함
    sendButton = screen.getByRole('button', { name: /보내기/i })
    expect(sendButton).toBeDisabled()
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    render(
      <SendModal 
        isOpen={true}
        question={mockQuestion}
        labels={mockLabels}
        onClose={() => {}}
      />
    )
    
    const sendButton = screen.getByRole('button', { name: /보내기/i })
    expect(sendButton).toHaveClass(/min-h-\[44px\]/)
    
    const addLabelButton = screen.getByRole('button', { name: /새 가족 추가/i })
    expect(addLabelButton).toHaveClass(/min-h-\[44px\]/)
  })
})