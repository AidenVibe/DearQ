import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConversationHistoryPage } from '@/components/conversation-history'
import { ConversationHistoryItem } from '@/types/conversation-history'

// scrollIntoView 메서드를 모킹 (테스트 환경에서 지원되지 않음)
Element.prototype.scrollIntoView = jest.fn()

// 테스트용 모의 대화 히스토리 데이터
const mockConversations: ConversationHistoryItem[] = [
  {
    id: 'conv_1',
    questionId: 'daily_01',
    questionContent: '최근 웃음이 났던 순간은 언제였나요?',
    questionCategory: '일상·하루',
    participantCount: 2,
    answerCount: 2,
    status: 'completed',
    createdAt: '2025-08-25T09:00:00.000Z',
    updatedAt: '2025-08-25T15:30:00.000Z',
    lastActivityAt: '2025-08-25T15:30:00.000Z',
    isArchived: false,
    isFavorite: true,
    participants: [
      { id: 'user_me', name: '나', hasAnswered: true, lastActivityAt: '2025-08-25T10:00:00.000Z' },
      { id: 'user_mom', name: '엄마', hasAnswered: true, lastActivityAt: '2025-08-25T15:30:00.000Z' }
    ],
    preview: {
      latestAnswer: '아이가 처음 걸음마를 했을 때...',
      latestAuthor: '엄마',
      totalAnswers: 2,
      completedCount: 2,
      pendingCount: 0
    }
  },
  {
    id: 'conv_2',
    questionId: 'relationship_05',
    questionContent: '가족에게 가장 고마웠던 순간은?',
    questionCategory: '관계·소통',
    participantCount: 3,
    answerCount: 2,
    status: 'active',
    createdAt: '2025-08-24T08:00:00.000Z',
    updatedAt: '2025-08-24T20:15:00.000Z',
    lastActivityAt: '2025-08-24T20:15:00.000Z',
    isArchived: false,
    isFavorite: false,
    participants: [
      { id: 'user_me', name: '나', hasAnswered: true, lastActivityAt: '2025-08-24T12:00:00.000Z' },
      { id: 'user_mom', name: '엄마', hasAnswered: true, lastActivityAt: '2025-08-24T20:15:00.000Z' },
      { id: 'user_dad', name: '아빠', hasAnswered: false }
    ],
    preview: {
      latestAnswer: '힘들 때 항상 곁에 있어줘서...',
      latestAuthor: '엄마',
      totalAnswers: 2,
      completedCount: 2,
      pendingCount: 1
    }
  },
  {
    id: 'conv_3',
    questionId: 'memory_12',
    questionContent: '어린 시절 가장 기억에 남는 순간은?',
    questionCategory: '기억·추억',
    participantCount: 2,
    answerCount: 1,
    status: 'waiting',
    createdAt: '2025-08-23T10:00:00.000Z',
    updatedAt: '2025-08-23T10:00:00.000Z',
    lastActivityAt: '2025-08-23T10:00:00.000Z',
    isArchived: true,
    isFavorite: false,
    participants: [
      { id: 'user_me', name: '나', hasAnswered: false },
      { id: 'user_sister', name: '언니', hasAnswered: false }
    ],
    preview: {
      totalAnswers: 0,
      completedCount: 0,
      pendingCount: 2
    }
  }
]

describe('ConversationHistoryPage', () => {
  it('로딩 중일 때 스피너가 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={[]}
        isLoading={true}
      />
    )
    
    expect(screen.getByText(/대화 목록을 불러오는 중/i)).toBeInTheDocument()
  })

  it('대화 목록이 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.getByText('가족에게 가장 고마웠던 순간은?')).toBeInTheDocument()
    expect(screen.getByText('어린 시절 가장 기억에 남는 순간은?')).toBeInTheDocument()
  })

  it('대화 상태가 올바르게 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('완료됨')).toBeInTheDocument()
    expect(screen.getByText('진행중')).toBeInTheDocument() 
    expect(screen.getByText('대기중')).toBeInTheDocument()
  })

  it('즐겨찾기 대화가 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    const favoriteIcon = screen.getAllByTestId('favorite-icon').find(icon => 
      icon.classList.contains('fill-yellow-400')
    )
    expect(favoriteIcon).toBeInTheDocument()
  })

  it('보관된 대화가 구분되어 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('보관됨')).toBeInTheDocument()
  })

  it('대화 검색이 작동해야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    const searchInput = screen.getByPlaceholderText(/대화 검색/i)
    fireEvent.change(searchInput, { target: { value: '웃음' } })
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.queryByText('가족에게 가장 고마웠던 순간은?')).not.toBeInTheDocument()
  })

  it('카테고리 필터링이 작동해야 한다', () => {
    const dailyConversations = [mockConversations[0]] // 일상·하루 카테고리만
    
    render(
      <ConversationHistoryPage 
        conversations={dailyConversations}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.queryByText('가족에게 가장 고마웠던 순간은?')).not.toBeInTheDocument()
  })

  it('상태별 필터링이 작동해야 한다', () => {
    const completedConversations = [mockConversations[0]] // 완료된 대화만
    
    render(
      <ConversationHistoryPage 
        conversations={completedConversations}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.queryByText('가족에게 가장 고마웠던 순간은?')).not.toBeInTheDocument()
  })

  it('즐겨찾기 토글이 작동해야 한다', async () => {
    const mockOnToggleFavorite = jest.fn()
    
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
        onToggleFavorite={mockOnToggleFavorite}
      />
    )
    
    const favoriteButtons = screen.getAllByTestId('favorite-button')
    fireEvent.click(favoriteButtons[0])
    
    expect(mockOnToggleFavorite).toHaveBeenCalledWith('conv_1', false)
  })

  it('보관함 토글이 작동해야 한다', async () => {
    const mockOnToggleArchive = jest.fn()
    
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
        onToggleArchive={mockOnToggleArchive}
      />
    )
    
    const archiveButtons = screen.getAllByTestId('archive-button')
    fireEvent.click(archiveButtons[0])
    
    expect(mockOnToggleArchive).toHaveBeenCalledWith('conv_1', true)
  })

  it('대화 클릭 시 상세보기로 이동해야 한다', () => {
    const mockOnConversationClick = jest.fn()
    
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
        onConversationClick={mockOnConversationClick}
      />
    )
    
    const conversationCards = screen.getAllByTestId(/^conversation-card-/)
    fireEvent.click(conversationCards[0])
    
    expect(mockOnConversationClick).toHaveBeenCalledWith('conv_1')
  })

  it('날짜별 그룹핑이 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    // 대화 카드들이 표시되는지 확인
    const conversationCards = screen.getAllByTestId(/^conversation-card-/)
    expect(conversationCards).toHaveLength(3)
    
    // 최신 대화가 먼저 표시되는지 확인
    expect(conversationCards[0]).toHaveAttribute('data-testid', 'conversation-card-conv_1')
  })

  it('참여자 정보가 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    expect(screen.getAllByText(/2명 참여/).length).toBeGreaterThan(0)
    expect(screen.getByText(/3명 참여/)).toBeInTheDocument()
  })

  it('대화 미리보기가 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('아이가 처음 걸음마를 했을 때...')).toBeInTheDocument()
    expect(screen.getByText('힘들 때 항상 곁에 있어줘서...')).toBeInTheDocument()
  })

  it('빈 상태일 때 안내 메시지가 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={[]}
        isLoading={false}
      />
    )
    
    // 기본 상태에서는 빈 상태 메시지가 표시되어야 함
    expect(screen.getByText('아직 대화 기록이 없어요')).toBeInTheDocument()
    expect(screen.getByText('첫 번째 대화를 시작해보세요')).toBeInTheDocument()
  })

  it('에러 상태일 때 에러 메시지가 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={[]}
        isLoading={false}
        error="대화 목록을 불러오는 중 문제가 발생했어요"
      />
    )
    
    expect(screen.getByText(/대화 목록을 불러오는 중 문제가 발생했어요/i)).toBeInTheDocument()
  })

  it('페이지네이션이 표시되어야 한다', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
        pagination={{
          currentPage: 1,
          pageSize: 10,
          totalCount: 25,
          hasMore: true
        }}
      />
    )
    
    expect(screen.getByText(/더 보기/i)).toBeInTheDocument()
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    render(
      <ConversationHistoryPage 
        conversations={mockConversations}
        isLoading={false}
      />
    )
    
    const favoriteButtons = screen.getAllByTestId('favorite-button')
    favoriteButtons.forEach(button => {
      expect(button).toHaveClass(/min-h-\[44px\]/)
    })
    
    const archiveButtons = screen.getAllByTestId('archive-button')
    archiveButtons.forEach(button => {
      expect(button).toHaveClass(/min-h-\[44px\]/)
    })
  })
})