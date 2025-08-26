"use client"

import { LabelManagement } from '@/components/label-management'

export default function LabelsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">가족 관리</h1>
        <p className="text-gray-600">
          대화를 나눌 가족 구성원을 관리하세요
        </p>
      </header>

      <LabelManagement />
    </div>
  )
}