'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { SettingsContextValue } from '@/types/settings'
import { useSettings } from '@/hooks/useSettings'

// 설정 컨텍스트 생성
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

// 설정 컨텍스트 프로바이더 Props
interface SettingsProviderProps {
  children: ReactNode
}

/**
 * 설정 컨텍스트 프로바이더
 * 앱 전체에서 사용할 설정 상태를 제공합니다.
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const settingsHook = useSettings()
  
  const contextValue: SettingsContextValue = {
    ...settingsHook,
    clearError: settingsHook.clearError || (() => {})
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * 설정 컨텍스트 사용 훅
 * 컴포넌트에서 설정 상태에 접근할 때 사용합니다.
 */
export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext)
  
  if (context === undefined) {
    throw new Error(
      'useSettingsContext는 SettingsProvider 내부에서만 사용할 수 있습니다.'
    )
  }
  
  return context
}

/**
 * 특정 설정 섹션의 변경사항만 감지하는 훅
 */
export function useSettingsSection(sectionId: string) {
  const { userSettings, familySettings, appSettings, updateUserSetting, updateFamilySetting, updateAppSetting } = useSettingsContext()
  
  // 섹션별로 필요한 설정만 반환
  const getSectionSettings = () => {
    switch (sectionId) {
      case 'profile':
        return userSettings?.profile || null
      case 'personalization':
        return userSettings?.personalization || null
      case 'notifications':
        return userSettings?.notifications || null
      case 'conversation':
        return userSettings?.conversation || null
      case 'weeklyHighlight':
        return userSettings?.weeklyHighlight || null
      case 'family':
        return familySettings || null
      case 'performance':
        return appSettings.performance
      case 'security':
        return appSettings.security
      case 'data':
        return appSettings.data
      case 'accessibility':
        return appSettings.accessibility
      default:
        return null
    }
  }

  const updateSectionSetting = (path: string, value: any) => {
    const fullPath = `${sectionId}.${path}`
    
    // 사용자 설정 섹션들
    if (['profile', 'personalization', 'notifications', 'conversation', 'weeklyHighlight'].includes(sectionId)) {
      return updateUserSetting(fullPath, value)
    }
    
    // 가족 설정
    if (sectionId === 'family') {
      return updateFamilySetting(path, value)
    }
    
    // 앱 설정 섹션들
    if (['performance', 'security', 'data', 'accessibility'].includes(sectionId)) {
      return updateAppSetting(fullPath, value)
    }
    
    return Promise.resolve(false)
  }

  return {
    settings: getSectionSettings(),
    updateSetting: updateSectionSetting
  }
}