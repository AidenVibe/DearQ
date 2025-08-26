import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WeeklyHighlightPage } from '@/components/weekly-highlight'
import { WeeklyHighlight, FamilyHighlight, BestConversation } from '@/types/weekly-highlight'

// scrollIntoView 메서드를 모킹 (테스트 환경에서 지원되지 않음)
Element.prototype.scrollIntoView = jest.fn()

// html2canvas 모킹 (이미지 생성 테스트용)
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// useWeeklyShare 훅 모킹
const mockUseWeeklyShare = {
  status: 'idle' as const,
  generatedImage: null,
  progress: 0,
  error: null,
  lastSharedAt: null,
  isKakaoReady: false,
  canShare: {
    kakao: true,
    download: true,
    native: false,
    clipboard: true
  },
  setImageElement: jest.fn(),
  generateImage: jest.fn(),
  downloadImage: jest.fn(),
  shareToKakao: jest.fn(),
  shareToOther: jest.fn(),
  reset: jest.fn(),
  clearError: jest.fn()
}

jest.mock('@/hooks/useWeeklyShare', () => ({
  useWeeklyShare: () => mockUseWeeklyShare
}), { virtual: true })

// 테스트용 모의 주간 하이라이트 데이터
const mockBestConversations: BestConversation[] = [
  {
    id: 'conv_1',
    questionContent: '최근 웃음이 났던 순간은 언제였나요?',
    questionCategory: '일상·하루',
    participantCount: 2,
    totalAnswers: 2,
    engagementScore: 95,
    createdAt: '2025-08-25T09:00:00.000Z',
    preview: {
      snippet: '아이가 처음 걸음마를 했을 때...',
      authorName: '엄마'
    }
  },
  {
    id: 'conv_2',
    questionContent: '가족에게 가장 고마웠던 순간은?',
    questionCategory: '관계·소통',
    participantCount: 3,
    totalAnswers: 2,
    engagementScore: 87,
    createdAt: '2025-08-24T08:00:00.000Z',
    preview: {
      snippet: '힘들 때 항상 곁에 있어줘서...',
      authorName: '나'
    }
  },
  {
    id: 'conv_3',
    questionContent: '어린 시절 가장 기억에 남는 순간은?',
    questionCategory: '기억·추억',
    participantCount: 2,
    totalAnswers: 1,
    engagementScore: 72,
    createdAt: '2025-08-23T10:00:00.000Z',
    preview: {
      snippet: '할아버지와 함께 낚시했던 여름날...',
      authorName: '아빠'
    }
  }
]

const mockFamilyHighlights: FamilyHighlight[] = [
  {
    familyName: '엄마',
    conversationCount: 8,
    responseRate: 0.9,
    bestConversations: mockBestConversations,
    relationshipType: '부모',
    lastActiveAt: '2025-08-25T15:30:00.000Z'
  },
  {
    familyName: '아빠',
    conversationCount: 5,
    responseRate: 0.75,
    bestConversations: [mockBestConversations[2]],
    relationshipType: '부모',
    lastActiveAt: '2025-08-24T20:15:00.000Z'
  }
]

const mockWeeklyHighlight: WeeklyHighlight = {
  id: 'weekly_2025_34',
  userId: 'user_me',
  weekStart: '2025-08-24T00:00:00.000Z',
  weekEnd: '2025-08-30T23:59:59.000Z',
  generatedAt: '2025-08-25T18:00:00.000Z',
  statistics: {
    totalConversations: 12,
    totalAnswers: 18,
    completedConversations: 8,
    averageResponseTime: 4.5,
    responseRate: 0.85,
    participatingFamilies: 2,
    mostActiveDay: 'monday',
    conversationsByDay: [
      { date: '2025-08-24', count: 3, dayOfWeek: 'sunday' },
      { date: '2025-08-25', count: 5, dayOfWeek: 'monday' },
      { date: '2025-08-26', count: 2, dayOfWeek: 'tuesday' },
      { date: '2025-08-27', count: 1, dayOfWeek: 'wednesday' },
      { date: '2025-08-28', count: 1, dayOfWeek: 'thursday' },
      { date: '2025-08-29', count: 0, dayOfWeek: 'friday' },
      { date: '2025-08-30', count: 0, dayOfWeek: 'saturday' }
    ]
  },
  familyHighlights: mockFamilyHighlights,
  shareData: {
    title: '이번 주 우리 가족 이야기',
    description: '8월 4주차 가족과의 소중한 대화들',
    shareText: '이번 주 우리 가족은 12번의 대화를 나누었어요! #마음배달 #가족대화',
    hashtags: ['마음배달', '가족대화', '소통'],
    metadata: {
      ogTitle: '이번 주 우리 가족 이야기',
      ogDescription: '8월 4주차 가족과의 소중한 대화들',
      twitterCard: 'summary_large_image'
    }
  },
  status: 'ready'
}

const mockEmptyWeeklyHighlight: WeeklyHighlight = {
  ...mockWeeklyHighlight,
  id: 'weekly_2025_35',
  statistics: {
    ...mockWeeklyHighlight.statistics,
    totalConversations: 2,
    completedConversations: 1
  },
  familyHighlights: [],
  status: 'ready'
}

describe('WeeklyHighlightPage', () => {
  beforeEach(() => {
    // html2canvas 모킹 초기화는 제거 (직접 접근 불가)
    
    // 모킹된 훅 함수들 초기화
    Object.values(mockUseWeeklyShare).forEach(fn => {
      if (typeof fn === 'function') {
        fn.mockReset?.()
      }
    })
    
    // 기본 상태로 리셋
    mockUseWeeklyShare.status = 'idle'
    mockUseWeeklyShare.error = null
    mockUseWeeklyShare.progress = 0
    mockUseWeeklyShare.lastSharedAt = null
  })

  it('로딩 중일 때 스피너가 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={null}
        isLoading={true}
      />
    )
    
    expect(screen.getByText(/주간 하이라이트를 생성하는 중/i)).toBeInTheDocument()
  })

  it('주간 하이라이트 데이터가 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('이번 주 우리 가족 이야기')).toBeInTheDocument()
    expect(screen.getByText('8월 4주차 가족과의 소중한 대화들')).toBeInTheDocument()
    expect(screen.getByText('12번의 대화')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument() // 응답률
  })

  it('주간 통계가 올바르게 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    expect(screen.getByText((content) => content.includes('총') && content.includes('12') && content.includes('개 대화'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('8') && content.includes('개 완료'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('응답률') && content.includes('85%'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('2') && content.includes('명 참여'))).toBeInTheDocument()
    expect(screen.getByText('가장 활발한 날:')).toBeInTheDocument()
    expect(screen.getByText('월요일')).toBeInTheDocument()
  })

  it('가족별 하이라이트가 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    expect(screen.getByText((content) => content.includes('엄마') && content.includes('님과의 대화'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('8') && content.includes('개 대화'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('90%'))).toBeInTheDocument()
    
    expect(screen.getByText((content) => content.includes('아빠') && content.includes('님과의 대화'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('5') && content.includes('개 대화'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('75%'))).toBeInTheDocument()
  })

  it('Best 3 대화가 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('최근 웃음이 났던 순간은 언제였나요?')).toBeInTheDocument()
    expect(screen.getByText('"아이가 처음 걸음마를 했을 때..."')).toBeInTheDocument()
    expect(screen.getByText('- 엄마')).toBeInTheDocument()
    
    expect(screen.getByText('가족에게 가장 고마웠던 순간은?')).toBeInTheDocument()
    expect(screen.getByText('"힘들 때 항상 곁에 있어줘서..."')).toBeInTheDocument()
  })

  it('대화 수 부족 시 안내 메시지가 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockEmptyWeeklyHighlight}
        isLoading={false}
      />
    )
    
    expect(screen.getByText(/조금 더 대화해보세요/i)).toBeInTheDocument()
    expect(screen.getByText(/이번 주는 2번의 대화를 나누었어요/i)).toBeInTheDocument()
    expect(screen.getByText(/3번 이상 대화하시면 더 풍성한 하이라이트를 만들어드려요/i)).toBeInTheDocument()
  })

  it('일별 대화 차트가 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    // 차트 컨테이너 확인
    expect(screen.getByTestId('weekly-conversation-chart')).toBeInTheDocument()
    
    // 가장 활발했던 월요일 표시 확인
    const mondayBar = screen.getByTestId('chart-bar-monday')
    expect(mondayBar).toHaveAttribute('data-count', '5')
  })

  it('이미지로 저장 버튼을 클릭하면 이미지 생성 함수가 호출되어야 한다', async () => {
    const mockOnSaveImage = jest.fn()
    mockUseWeeklyShare.downloadImage.mockResolvedValue(true)
    
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
        onSaveImage={mockOnSaveImage}
      />
    )
    
    const saveButton = screen.getByRole('button', { name: /이미지로 저장/i })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockOnSaveImage).toHaveBeenCalledWith(mockWeeklyHighlight)
    })
  })

  it('카카오 공유 버튼을 클릭하면 공유 함수가 호출되어야 한다', () => {
    const mockOnKakaoShare = jest.fn()
    
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
        onKakaoShare={mockOnKakaoShare}
      />
    )
    
    const shareButton = screen.getByRole('button', { name: /카카오톡 공유/i })
    fireEvent.click(shareButton)
    
    expect(mockOnKakaoShare).toHaveBeenCalledWith(mockWeeklyHighlight.shareData)
  })

  it('Best 대화 카드를 클릭하면 상세보기로 이동해야 한다', () => {
    const mockOnConversationClick = jest.fn()
    
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
        onConversationClick={mockOnConversationClick}
      />
    )
    
    const conversationCards = screen.getAllByTestId(/^best-conversation-/)
    fireEvent.click(conversationCards[0])
    
    expect(mockOnConversationClick).toHaveBeenCalledWith('conv_1')
  })

  it('이전 주 하이라이트 보기 버튼이 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
        hasPreviousWeeks={true}
      />
    )
    
    expect(screen.getByRole('button', { name: /이전 주 보기/i })).toBeInTheDocument()
  })

  it('주간 인사이트가 표시되어야 한다', () => {
    const highlightWithInsights = {
      ...mockWeeklyHighlight,
      insights: [
        {
          type: 'achievement' as const,
          title: '대화 마스터!',
          description: '이번 주 12번의 대화를 나누었어요. 정말 대단해요!',
          iconName: 'trophy',
          actionText: '계속하기',
          actionUrl: '/home'
        }
      ]
    }
    
    render(
      <WeeklyHighlightPage 
        highlight={highlightWithInsights}
        isLoading={false}
      />
    )
    
    expect(screen.getByText('대화 마스터!')).toBeInTheDocument()
    expect(screen.getByText('이번 주 12번의 대화를 나누었어요. 정말 대단해요!')).toBeInTheDocument()
  })

  it('에러 상태일 때 에러 메시지가 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={null}
        isLoading={false}
        error="주간 하이라이트를 불러오는 중 문제가 발생했어요"
      />
    )
    
    expect(screen.getByText(/주간 하이라이트를 불러오는 중 문제가 발생했어요/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /다시 시도/i })).toBeInTheDocument()
  })

  it('주 선택 드롭다운이 작동해야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
        availableWeeks={[
          '2025-08-24',
          '2025-08-17',
          '2025-08-10'
        ]}
      />
    )
    
    const weekSelector = screen.getByLabelText(/주 선택/i)
    expect(weekSelector).toBeInTheDocument()
    
    fireEvent.click(weekSelector)
    expect(screen.getByText('8월 4주차')).toBeInTheDocument()
    expect(screen.getByText('8월 3주차')).toBeInTheDocument()
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    const saveButton = screen.getByRole('button', { name: /이미지로 저장/i })
    expect(saveButton).toHaveClass(/min-h-\[44px\]/)
    
    const shareButton = screen.getByRole('button', { name: /카카오톡 공유/i })
    expect(shareButton).toHaveClass(/min-h-\[44px\]/)
    
    const conversationCards = screen.getAllByTestId(/^best-conversation-/)
    conversationCards.forEach(card => {
      expect(card).toHaveClass(/min-h-\[44px\]/)
    })
  })

  it('공유 상태별 UI가 올바르게 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
        shareStatus="generating-image"
      />
    )
    
    expect(screen.getByText(/이미지 생성 중/i)).toBeInTheDocument()
    
    const saveButton = screen.getByText(/이미지 생성 중/i).closest('button')
    expect(saveButton).toBeDisabled()
  })

  it('빈 상태일 때 새 대화 시작 버튼이 표시되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={null}
        isLoading={false}
        isEmpty={true}
      />
    )
    
    expect(screen.getByText(/아직 주간 하이라이트가 없어요/i)).toBeInTheDocument()
    expect(screen.getByText(/첫 번째 대화를 시작해보세요/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /대화 시작하기/i })).toBeInTheDocument()
  })

  it('주간 성장률이 표시되어야 한다', () => {
    const highlightWithGrowth = {
      ...mockWeeklyHighlight,
      weeklyGrowth: 0.25 // 25% 성장
    }
    
    render(
      <WeeklyHighlightPage 
        highlight={highlightWithGrowth}
        isLoading={false}
      />
    )
    
    expect(screen.getByText(/전주 대비 25% 증가/i)).toBeInTheDocument()
    expect(screen.getByTestId('growth-indicator')).toHaveClass(/text-green-500/)
  })

  // TODO: 이미지 생성 및 공유 기능 테스트는 추후 개선 필요
  // 현재는 모킹 이슈로 인해 기본 기능만 테스트

  it('data-image-target 속성이 메인 컨테이너에 설정되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    const mainContainer = screen.getByTestId('weekly-highlight-content')
    expect(mainContainer).toHaveAttribute('data-image-target')
  })

  it('공유 버튼 영역이 이미지에서 제외되도록 data-exclude-from-image 속성이 설정되어야 한다', () => {
    render(
      <WeeklyHighlightPage 
        highlight={mockWeeklyHighlight}
        isLoading={false}
      />
    )
    
    const shareSection = screen.getByTestId('share-buttons-section')
    expect(shareSection).toHaveAttribute('data-exclude-from-image', 'true')
  })
})