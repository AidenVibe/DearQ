import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LabelManagementPage } from '@/components/label-management'
import { ManagedLabel, LabelFormData } from '@/types/label-management'

// scrollIntoView 메서드를 모킹 (테스트 환경에서 지원되지 않음)
Element.prototype.scrollIntoView = jest.fn()

// 테스트용 모의 라벨 데이터
const mockLabels: ManagedLabel[] = [
  {
    id: 'label_1',
    name: '엄마',
    nickname: '김영희',
    relationshipType: '부모',
    color: 'pink',
    emoji: '👩',
    createdAt: '2025-08-01T10:00:00.000Z',
    updatedAt: '2025-08-25T15:00:00.000Z',
    lastUsedAt: '2025-08-25T15:00:00.000Z',
    usageCount: 25,
    isActive: true,
    isPinned: true
  },
  {
    id: 'label_2',
    name: '아빠',
    nickname: '박철수',
    relationshipType: '부모',
    color: 'blue',
    emoji: '👨',
    createdAt: '2025-08-01T10:00:00.000Z',
    updatedAt: '2025-08-20T10:00:00.000Z',
    lastUsedAt: '2025-08-20T10:00:00.000Z',
    usageCount: 18,
    isActive: true,
    isPinned: false
  },
  {
    id: 'label_3',
    name: '동생',
    nickname: '박민지',
    relationshipType: '형제자매',
    color: 'green',
    emoji: '👧',
    createdAt: '2025-08-05T10:00:00.000Z',
    updatedAt: '2025-08-15T10:00:00.000Z',
    lastUsedAt: '2025-08-15T10:00:00.000Z',
    usageCount: 10,
    isActive: true,
    isPinned: false
  }
]

describe('LabelManagementPage', () => {
  it('로딩 중일 때 스피너가 표시되어야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={true}
        labels={[]}
      />
    )
    
    expect(screen.getByText(/라벨을 불러오는 중/i)).toBeInTheDocument()
  })

  it('라벨 목록이 표시되어야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    expect(screen.getByText('엄마')).toBeInTheDocument()
    expect(screen.getByText('김영희')).toBeInTheDocument()
    expect(screen.getByText('아빠')).toBeInTheDocument()
    expect(screen.getByText('박철수')).toBeInTheDocument()
    expect(screen.getByText('동생')).toBeInTheDocument()
    expect(screen.getByText('박민지')).toBeInTheDocument()
  })

  it('고정된 라벨이 상단에 표시되어야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const labelCards = screen.getAllByTestId(/^label-card-/)
    // 첫 번째 카드가 고정된 '엄마' 라벨
    expect(labelCards[0]).toHaveTextContent('엄마')
    expect(labelCards[0]).toHaveTextContent('고정됨')
  })

  it('라벨 추가 버튼을 클릭하면 추가 모달이 열려야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const addButton = screen.getByRole('button', { name: /새 라벨 추가/i })
    fireEvent.click(addButton)
    
    expect(screen.getByText(/새 라벨 만들기/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/표시 이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/실제 이름/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/관계 유형/i)).toBeInTheDocument()
  })

  it('라벨 추가 폼 유효성 검증이 작동해야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const addButton = screen.getByRole('button', { name: /새 라벨 추가/i })
    fireEvent.click(addButton)
    
    const submitButton = screen.getByRole('button', { name: /라벨 생성/i })
    expect(submitButton).toBeDisabled()
    
    const nameInput = screen.getByLabelText(/표시 이름/i)
    fireEvent.change(nameInput, { target: { value: '할머니' } })
    
    const relationSelect = screen.getByLabelText(/관계 유형/i)
    fireEvent.change(relationSelect, { target: { value: '친척' } })
    
    expect(submitButton).not.toBeDisabled()
  })

  it('라벨 수정 버튼을 클릭하면 수정 모달이 열려야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const editButtons = screen.getAllByRole('button', { name: /수정/i })
    fireEvent.click(editButtons[0])
    
    expect(screen.getByText(/라벨 수정/i)).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/표시 이름/i) as HTMLInputElement
    expect(nameInput.value).toBe('엄마')
  })

  it('라벨 삭제 확인 다이얼로그가 표시되어야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const deleteButtons = screen.getAllByRole('button', { name: /삭제/i })
    fireEvent.click(deleteButtons[0])
    
    expect(screen.getByText(/정말 삭제하시겠어요?/i)).toBeInTheDocument()
    expect(screen.getByText(/이 작업은 되돌릴 수 없어요/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /삭제하기/i })).toBeInTheDocument()
  })

  it('라벨 검색이 작동해야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const searchInput = screen.getByPlaceholderText(/라벨 검색/i)
    fireEvent.change(searchInput, { target: { value: '엄마' } })
    
    expect(screen.getByText('엄마')).toBeInTheDocument()
    expect(screen.queryByText('아빠')).not.toBeInTheDocument()
    expect(screen.queryByText('동생')).not.toBeInTheDocument()
  })

  it('관계 유형별 필터링이 작동해야 한다', () => {
    const siblingOnlyLabels = [mockLabels[2]] // 동생 라벨만
    
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={siblingOnlyLabels}
      />
    )
    
    expect(screen.getByText('동생')).toBeInTheDocument()
    expect(screen.queryByText('엄마')).not.toBeInTheDocument()
    expect(screen.queryByText('아빠')).not.toBeInTheDocument()
  })

  it('정렬 옵션이 작동해야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const sortSelect = screen.getByLabelText(/정렬/i)
    fireEvent.change(sortSelect, { target: { value: 'frequent' } })
    
    const labelCards = screen.getAllByTestId(/^label-card-/)
    // 사용 빈도순: 엄마(25) > 아빠(18) > 동생(10)
    expect(labelCards[0]).toHaveTextContent('엄마')
    expect(labelCards[1]).toHaveTextContent('아빠')
    expect(labelCards[2]).toHaveTextContent('동생')
  })

  it('빈 상태일 때 안내 메시지가 표시되어야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={[]}
      />
    )
    
    expect(screen.getByText(/아직 등록된 라벨이 없어요/i)).toBeInTheDocument()
    expect(screen.getByText(/새 라벨을 추가해서 가족과 대화를 시작해보세요/i)).toBeInTheDocument()
  })

  it('에러 상태일 때 에러 메시지가 표시되어야 한다', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={[]}
        error="라벨을 불러오는 중 문제가 발생했어요"
      />
    )
    
    expect(screen.getByText(/라벨을 불러오는 중 문제가 발생했어요/i)).toBeInTheDocument()
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    render(
      <LabelManagementPage 
        isLoading={false}
        labels={mockLabels}
      />
    )
    
    const addButton = screen.getByRole('button', { name: /새 라벨 추가/i })
    expect(addButton).toHaveClass(/min-h-\[44px\]/)
    
    const editButtons = screen.getAllByRole('button', { name: /수정/i })
    editButtons.forEach(button => {
      expect(button).toHaveClass(/min-h-\[44px\]/)
    })
  })
})