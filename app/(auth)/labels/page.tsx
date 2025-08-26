"use client"

import { LabelManagementPage } from '@/components/label-management'
import { ManagedLabel } from '@/types/label-management'

export default function LabelsPage() {
  // 임시 ManagedLabel 더미 데이터
  const dummyLabels: ManagedLabel[] = [
    {
      id: 'label-1',
      name: '엄마',
      nickname: '김영희',
      relationshipType: '부모',
      color: 'pink',
      emoji: '👩',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      lastUsedAt: '2025-08-25T14:30:00Z',
      usageCount: 25,
      isActive: true,
      isPinned: true
    },
    {
      id: 'label-2',
      name: '아빠',
      nickname: '김철수',
      relationshipType: '부모',
      color: 'blue',
      emoji: '👨',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      lastUsedAt: '2025-08-24T18:15:00Z',
      usageCount: 18,
      isActive: true,
      isPinned: false
    },
    {
      id: 'label-3',
      name: '누나',
      nickname: '김민지',
      relationshipType: '형제자매',
      color: 'purple',
      emoji: '👧',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-26T00:00:00Z',
      lastUsedAt: '2025-08-23T10:45:00Z',
      usageCount: 12,
      isActive: true,
      isPinned: false
    }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">가족 관리</h1>
        <p className="text-gray-600">
          대화를 나눌 가족 구성원을 관리하세요 (총 {dummyLabels.length}명, 활성 {dummyLabels.filter(l => l.isActive).length}명)
        </p>
      </header>

      <LabelManagementPage labels={dummyLabels} />
    </div>
  )
}