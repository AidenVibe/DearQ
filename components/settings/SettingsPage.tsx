'use client'

import React, { useState, useCallback } from 'react'
// import { useSettingsContext } from '@/contexts/SettingsContext'
import { SettingsSection } from '@/types/settings'
import { ProfileSettings } from './sections/ProfileSettings'
import { PersonalizationSettings } from './sections/PersonalizationSettings'
// TODO: 아래 모듈들이 구현되면 주석 해제
// import { NotificationSettings } from './sections/NotificationSettings'
// import { ConversationSettings } from './sections/ConversationSettings'
// import { WeeklyHighlightSettings } from './sections/WeeklyHighlightSettings'
// import { FamilySettings } from './sections/FamilySettings'
// import { PerformanceSettings } from './sections/PerformanceSettings'
// import { SecuritySettings } from './sections/SecuritySettings'
// import { DataSettings } from './sections/DataSettings'
// import { AccessibilitySettings } from './sections/AccessibilitySettings'

interface SettingsPageProps {
  className?: string
  initialSection?: string
}

/**
 * 메인 설정 페이지 컴포넌트
 * 모든 설정 섹션을 관리하고 탐색 기능을 제공합니다.
 */
export function SettingsPage({ 
  className = '', 
  initialSection = 'profile' 
}: SettingsPageProps) {
  // TODO: SettingsProvider 추가 후 주석 해제
  // const { 
  //   sections, 
  //   syncState, 
  //   error, 
  //   clearError,
  //   syncWithServer,
  //   exportSettings,
  //   isInitialized 
  // } = useSettingsContext()
  
  // 임시 더미 데이터
  const sections: SettingsSection[] = [
    { id: 'profile', title: '프로필', description: '사용자 프로필 설정', icon: 'user', order: 1, isVisible: true },
    { id: 'personalization', title: '개인화', description: '테마 및 개인화 설정', icon: 'palette', order: 2, isVisible: true }
  ]
  const syncState = { isLoading: false, pendingChanges: 0, isOnline: true, lastSyncAt: null }
  const error = null
  const clearError = () => {}
  const syncWithServer = async () => {}
  const exportSettings = async () => ({ version: '1.0.0', data: {} })
  const isInitialized = true
  
  const [activeSection, setActiveSection] = useState(initialSection)
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  // 섹션 변경 핸들러
  const handleSectionChange = useCallback((sectionId: string) => {
    setActiveSection(sectionId)
    clearError()
  }, [clearError])

  // 검색 핸들러
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase())
  }, [])

  // 설정 내보내기 핸들러
  const handleExportSettings = useCallback(async () => {
    try {
      setIsExporting(true)
      const backup = await exportSettings()
      
      // Blob으로 파일 다운로드
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dearq-settings-${new Date().toISOString().slice(0, 10)}.json`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error('설정 내보내기 실패:', err)
    } finally {
      setIsExporting(false)
    }
  }, [exportSettings])

  // 검색 필터링된 섹션들
  const filteredSections = sections.filter(section => 
    section.isVisible && (
      !searchQuery || 
      section.title.toLowerCase().includes(searchQuery) ||
      section.description?.toLowerCase().includes(searchQuery)
    )
  )

  // 임시 설정 컴포넌트
  const PlaceholderSettings = ({ title }: { title: string }) => (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-600">이 설정 섹션은 아직 구현되지 않았습니다.</p>
      <p className="text-sm text-slate-500 mt-2">곧 업데이트 예정입니다.</p>
    </div>
  )

  // 활성 섹션 렌더링
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />
      case 'personalization':
        return <PersonalizationSettings />
      case 'notifications':
        return <PlaceholderSettings title="알림 설정" />
      case 'conversation':
        return <PlaceholderSettings title="대화 설정" />
      case 'weeklyHighlight':
        return <PlaceholderSettings title="주간 하이라이트 설정" />
      case 'family':
        return <PlaceholderSettings title="가족 설정" />
      case 'performance':
        return <PlaceholderSettings title="성능 설정" />
      case 'security':
        return <PlaceholderSettings title="보안 설정" />
      case 'data':
        return <PlaceholderSettings title="데이터 설정" />
      case 'accessibility':
        return <PlaceholderSettings title="접근성 설정" />
      default:
        return <div className="text-center text-slate-500">설정 섹션을 선택해주세요.</div>
    }
  }

  // 초기화 중일 때 로딩 표시
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">설정을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`settings-page min-h-screen bg-slate-50 ${className}`}>
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">설정</h1>
            <div className="flex items-center space-x-2">
              {/* 동기화 상태 */}
              {syncState.pendingChanges > 0 && (
                <button
                  onClick={syncWithServer}
                  disabled={syncState.isLoading}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
                  style={{ minHeight: '44px' }}
                >
                  {syncState.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                      <span>동기화 중...</span>
                    </>
                  ) : (
                    <>
                      <span>변경사항 {syncState.pendingChanges}개</span>
                      <span>동기화</span>
                    </>
                  )}
                </button>
              )}
              
              {/* 설정 내보내기 */}
              <button
                onClick={handleExportSettings}
                disabled={isExporting}
                className="px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50"
                style={{ minHeight: '44px' }}
              >
                {isExporting ? '내보내는 중...' : '설정 내보내기'}
              </button>
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <input
              type="text"
              placeholder="설정 검색..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ minHeight: '44px' }}
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 - 섹션 목록 */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-900 border-l-4 border-primary-600'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center w-full">
                    {/* 아이콘 영역 - 실제로는 아이콘 컴포넌트 사용 */}
                    <div className="flex-shrink-0 h-5 w-5 mr-3 bg-slate-300 rounded" 
                         title={section.icon}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{section.title}</div>
                      {section.description && (
                        <div className="text-xs text-slate-500 mt-1">
                          {section.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* 동기화 상태 정보 */}
            {syncState.lastSyncAt && (
              <div className="mt-6 p-3 bg-slate-100 rounded-md">
                <p className="text-xs text-slate-600">
                  마지막 동기화: {syncState.lastSyncAt.toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric', 
                    minute: '2-digit'
                  })}
                </p>
                <div className={`mt-1 h-2 w-2 rounded-full inline-block mr-1 ${
                  syncState.isOnline ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-slate-600">
                  {syncState.isOnline ? '온라인' : '오프라인'}
                </span>
              </div>
            )}
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}