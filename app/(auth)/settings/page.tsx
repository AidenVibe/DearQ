"use client"

import { SettingsPage as SettingsComponent } from '@/components/settings/SettingsPage'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">
          마음배달 서비스 설정을 관리하세요
        </p>
      </header>

      <SettingsComponent />
    </div>
  )
}