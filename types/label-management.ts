// 라벨 관리 시스템 타입 정의

export interface ManagedLabel {
  id: string
  name: string           // 표시명 (엄마, 아빠, 누나 등)
  nickname?: string      // 실제 닉네임
  relationshipType: RelationshipType
  color?: LabelColor     // 라벨 색상
  emoji?: string        // 라벨 이모지
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
  usageCount: number
  isActive: boolean
  isPinned: boolean     // 상단 고정 여부
}

export type RelationshipType = 
  | '부모' 
  | '형제자매' 
  | '자녀' 
  | '배우자' 
  | '친척' 
  | '기타'

export type LabelColor = 
  | 'red' 
  | 'blue' 
  | 'green' 
  | 'yellow' 
  | 'purple' 
  | 'pink' 
  | 'orange'
  | 'gray'

export interface LabelFormData {
  name: string
  nickname?: string
  relationshipType: RelationshipType
  color?: LabelColor
  emoji?: string
  isPinned?: boolean
}

export interface LabelManagementState {
  labels: ManagedLabel[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  filterType: RelationshipType | 'all'
  sortBy: LabelSortOption
  selectedLabel: ManagedLabel | null
  modalState: LabelModalState
}

export type LabelSortOption = 
  | 'recent'      // 최근 사용순
  | 'frequent'    // 자주 사용순
  | 'name'        // 이름순
  | 'created'     // 생성일순

export type LabelModalState = 
  | 'closed'
  | 'add'
  | 'edit'
  | 'delete-confirm'

export interface LabelListResponse {
  labels: ManagedLabel[]
  total: number
  hasMore: boolean
}

export interface LabelOperationResponse {
  success: boolean
  label?: ManagedLabel
  message: string
}

export interface LabelStatistics {
  totalLabels: number
  activeLabels: number
  mostUsedLabel?: ManagedLabel
  recentlyUsedLabels: ManagedLabel[]
  labelsByType: Record<RelationshipType, number>
}