'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Label } from './ui/label'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Pin, 
  Users, 
  Heart,
  Filter,
  SortAsc,
  AlertCircle
} from 'lucide-react'
import { 
  ManagedLabel, 
  LabelFormData, 
  RelationshipType,
  LabelColor,
  LabelSortOption,
  LabelModalState,
  LabelManagementState
} from '@/types/label-management'

interface LabelManagementPageProps {
  labels?: ManagedLabel[]
  isLoading?: boolean
  error?: string | null
  onAddLabel?: (data: LabelFormData) => Promise<void>
  onEditLabel?: (id: string, data: LabelFormData) => Promise<void>
  onDeleteLabel?: (id: string) => Promise<void>
  onTogglePin?: (id: string) => Promise<void>
}

const relationshipTypes: RelationshipType[] = ['부모', '형제자매', '자녀', '배우자', '친척', '기타']
const labelColors: LabelColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'gray']
const colorMap: Record<LabelColor, string> = {
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
  orange: 'bg-orange-100 text-orange-700',
  gray: 'bg-gray-100 text-gray-700'
}

export function LabelManagementPage({
  labels: propLabels = [],
  isLoading = false,
  error: propError = null,
  onAddLabel,
  onEditLabel,
  onDeleteLabel,
  onTogglePin
}: LabelManagementPageProps) {
  const [state, setState] = useState<LabelManagementState>({
    labels: propLabels,
    isLoading,
    error: propError,
    searchQuery: '',
    filterType: 'all',
    sortBy: 'recent',
    selectedLabel: null,
    modalState: 'closed'
  })

  const [formData, setFormData] = useState<LabelFormData>({
    name: '',
    nickname: '',
    relationshipType: '부모',
    color: 'blue',
    emoji: '',
    isPinned: false
  })

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setState(prev => ({
      ...prev,
      labels: propLabels,
      isLoading,
      error: propError
    }))
  }, [propLabels, isLoading, propError])

  // 필터링 및 정렬된 라벨 목록
  const filteredAndSortedLabels = useMemo(() => {
    let filtered = state.labels

    // 검색 필터
    if (state.searchQuery) {
      filtered = filtered.filter(label => 
        label.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        (label.nickname && label.nickname.toLowerCase().includes(state.searchQuery.toLowerCase()))
      )
    }

    // 관계 유형 필터
    if (state.filterType !== 'all') {
      filtered = filtered.filter(label => label.relationshipType === state.filterType)
    }

    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      // 고정된 항목 우선
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      switch (state.sortBy) {
        case 'recent':
          return new Date(b.lastUsedAt || b.updatedAt).getTime() - 
                 new Date(a.lastUsedAt || a.updatedAt).getTime()
        case 'frequent':
          return b.usageCount - a.usageCount
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [state.labels, state.searchQuery, state.filterType, state.sortBy])

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      nickname: '',
      relationshipType: '부모',
      color: 'blue',
      emoji: '',
      isPinned: false
    })
    setState(prev => ({ ...prev, modalState: 'add', selectedLabel: null }))
  }

  const handleOpenEditModal = (label: ManagedLabel) => {
    setFormData({
      name: label.name,
      nickname: label.nickname || '',
      relationshipType: label.relationshipType,
      color: label.color || 'blue',
      emoji: label.emoji || '',
      isPinned: label.isPinned
    })
    setState(prev => ({ ...prev, modalState: 'edit', selectedLabel: label }))
  }

  const handleCloseModal = () => {
    setState(prev => ({ ...prev, modalState: 'closed', selectedLabel: null }))
    setDeleteConfirmId(null)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.relationshipType) return

    try {
      if (state.modalState === 'add' && onAddLabel) {
        await onAddLabel(formData)
      } else if (state.modalState === 'edit' && state.selectedLabel && onEditLabel) {
        await onEditLabel(state.selectedLabel.id, formData)
      }
      handleCloseModal()
    } catch (error) {
      console.error('라벨 저장 실패:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmId || !onDeleteLabel) return

    try {
      await onDeleteLabel(deleteConfirmId)
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('라벨 삭제 실패:', error)
    }
  }

  const isFormValid = formData.name.length > 0 && formData.relationshipType

  // 로딩 상태
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">라벨을 불러오는 중...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">가족 라벨 관리</h1>
          <p className="text-muted-foreground">가족 구성원의 라벨을 관리하고 정리해보세요</p>
        </div>

        {/* 에러 메시지 */}
        {state.error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{state.error}</p>
            </CardContent>
          </Card>
        )}

        {/* 툴바 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {/* 검색 */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="라벨 검색..."
                    value={state.searchQuery}
                    onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 관계 필터 */}
              <div className="space-y-1">
                <Label htmlFor="filter-select" className="sr-only">관계 필터</Label>
                <Select 
                  value={state.filterType}
                  onValueChange={(value) => setState(prev => ({ ...prev, filterType: value as RelationshipType | 'all' }))}
                >
                  <SelectTrigger className="w-[150px]" id="filter-select">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {relationshipTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 정렬 */}
              <div className="space-y-1">
                <Label htmlFor="sort-select" className="sr-only">정렬</Label>
                <Select 
                  value={state.sortBy}
                  onValueChange={(value) => setState(prev => ({ ...prev, sortBy: value as LabelSortOption }))}
                >
                  <SelectTrigger className="w-[150px]" id="sort-select">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">최근 사용순</SelectItem>
                    <SelectItem value="frequent">자주 사용순</SelectItem>
                    <SelectItem value="name">이름순</SelectItem>
                    <SelectItem value="created">생성일순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 추가 버튼 */}
              <Button 
                onClick={handleOpenAddModal}
                className="min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 라벨 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 라벨 목록 */}
        {filteredAndSortedLabels.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {state.searchQuery || state.filterType !== 'all' 
                  ? '검색 결과가 없어요' 
                  : '아직 등록된 라벨이 없어요'}
              </h3>
              <p className="text-muted-foreground">
                {state.searchQuery || state.filterType !== 'all'
                  ? '다른 검색어나 필터를 시도해보세요'
                  : '새 라벨을 추가해서 가족과 대화를 시작해보세요'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedLabels.map((label) => (
              <Card 
                key={label.id}
                data-testid={`label-card-${label.id}`}
                className="relative hover:shadow-lg transition-shadow"
              >
                {label.isPinned && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      고정됨
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {label.emoji && (
                      <span className="text-2xl">{label.emoji}</span>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{label.name}</CardTitle>
                      {label.nickname && (
                        <p className="text-sm text-muted-foreground">{label.nickname}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="outline">{label.relationshipType}</Badge>
                    {label.color && (
                      <Badge className={colorMap[label.color]} variant="secondary">
                        {label.color}
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>사용 횟수: {label.usageCount}회</p>
                    {label.lastUsedAt && (
                      <p>마지막 사용: {new Date(label.lastUsedAt).toLocaleDateString('ko-KR')}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(label)}
                      className="flex-1 min-h-[44px]"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirmId(label.id)}
                      className="flex-1 min-h-[44px]"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 추가/수정 모달 */}
        <Dialog open={state.modalState === 'add' || state.modalState === 'edit'} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {state.modalState === 'add' ? '새 라벨 만들기' : '라벨 수정'}
              </DialogTitle>
              <DialogDescription>
                {state.modalState === 'add' 
                  ? '가족 구성원을 위한 새 라벨을 만들어보세요'
                  : '라벨 정보를 수정해보세요'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">표시 이름 <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="예: 엄마, 아빠, 누나"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nickname">실제 이름</Label>
                <Input
                  id="nickname"
                  placeholder="예: 김영희"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="relationship">관계 유형 <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.relationshipType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipType: value as RelationshipType }))}
                >
                  <SelectTrigger id="relationship">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">색상</Label>
                <Select 
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value as LabelColor }))}
                >
                  <SelectTrigger id="color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {labelColors.map(color => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${colorMap[color]}`} />
                          {color}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emoji">이모지</Label>
                <Input
                  id="emoji"
                  placeholder="예: 👩, 👨, 👧"
                  value={formData.emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                  maxLength={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                취소
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                {state.modalState === 'add' ? '라벨 생성' : '저장'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 삭제 확인 다이얼로그 */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>정말 삭제하시겠어요?</DialogTitle>
              <DialogDescription>
                이 작업은 되돌릴 수 없어요. 라벨과 관련된 모든 정보가 삭제됩니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                취소
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                삭제하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}