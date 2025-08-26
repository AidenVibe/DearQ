'use client'

import React from 'react'
import { useSettingsSection } from '@/contexts/SettingsContext'
import { SettingItem, SettingSection } from '../shared/SettingItem'
import { ThemeMode, LanguageCode, FontSize, ConversationStyle } from '@/types/settings'

/**
 * 개인화 설정 섹션 컴포넌트
 * 테마, 언어, 폰트, 대화 스타일 등을 관리합니다.
 */
export function PersonalizationSettings() {
  const { settings, updateSetting } = useSettingsSection('personalization')

  if (!settings) {
    return (
      <div className="p-6 text-center">
        <div className="text-slate-500">개인화 설정을 불러오는 중...</div>
      </div>
    )
  }

  const themeOptions = [
    { value: 'light', label: '라이트 모드', description: '밝은 테마' },
    { value: 'dark', label: '다크 모드', description: '어두운 테마' },
    { value: 'auto', label: '자동', description: '시스템 설정 따름' }
  ]

  const languageOptions = [
    { value: 'ko', label: '한국어', description: 'Korean' },
    { value: 'en', label: 'English', description: '영어' }
  ]

  const fontSizeOptions = [
    { value: 'small', label: '작게', description: '12-14px' },
    { value: 'medium', label: '보통', description: '16px' },
    { value: 'large', label: '크게', description: '18-20px' },
    { value: 'extra-large', label: '매우 크게', description: '22-24px' }
  ]

  const conversationStyleOptions = [
    { value: 'casual', label: '캐주얼', description: '편안한 대화체' },
    { value: 'formal', label: '정중함', description: '정중한 대화체' },
    { value: 'playful', label: '재미있게', description: '활발한 대화체' }
  ]

  return (
    <div className="p-6">
      <SettingSection
        title="개인화"
        description="앱의 모양과 느낌을 개인 취향에 맞게 조정하세요."
      />

      {/* 테마 설정 */}
      <SettingItem
        title="테마 모드"
        description="앱의 전체적인 색상 테마를 선택하세요."
        type="select"
        value={settings.theme}
        options={themeOptions}
        onChange={(value: ThemeMode) => updateSetting('theme', value)}
      />

      {/* 언어 설정 */}
      <SettingItem
        title="언어"
        description="앱에서 사용할 언어를 선택하세요."
        type="select"
        value={settings.language}
        options={languageOptions}
        onChange={(value: LanguageCode) => updateSetting('language', value)}
        requiresRestart
      />

      {/* 폰트 크기 설정 */}
      <SettingItem
        title="폰트 크기"
        description="텍스트의 크기를 조정하세요."
        type="select"
        value={settings.fontSize}
        options={fontSizeOptions}
        onChange={(value: FontSize) => updateSetting('fontSize', value)}
      >
        <div className="mt-3 p-3 bg-slate-50 rounded-md">
          <p className={`
            ${settings.fontSize === 'small' ? 'text-sm' : ''}
            ${settings.fontSize === 'medium' ? 'text-base' : ''}
            ${settings.fontSize === 'large' ? 'text-lg' : ''}
            ${settings.fontSize === 'extra-large' ? 'text-xl' : ''}
            text-slate-700
          `}>
            이것은 현재 폰트 크기의 미리보기입니다.
          </p>
        </div>
      </SettingItem>

      {/* 대화 스타일 설정 */}
      <SettingItem
        title="대화 스타일"
        description="가족과의 대화에서 선호하는 스타일을 선택하세요."
        type="select"
        value={settings.conversationStyle}
        options={conversationStyleOptions}
        onChange={(value: ConversationStyle) => updateSetting('conversationStyle', value)}
      >
        <div className="mt-3 p-3 bg-slate-50 rounded-md">
          <div className="text-sm text-slate-600">
            {settings.conversationStyle === 'casual' && (
              <p>예시: "안녕! 오늘 어떻게 지냈어? 😊"</p>
            )}
            {settings.conversationStyle === 'formal' && (
              <p>예시: "안녕하세요. 오늘 하루는 어떠셨나요?"</p>
            )}
            {settings.conversationStyle === 'playful' && (
              <p>예시: "야호~ 오늘도 멋진 하루 보냈지?! 🎉✨"</p>
            )}
          </div>
        </div>
      </SettingItem>

      {/* 추가 개인화 옵션들 */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">추가 옵션</h4>
        
        {/* 애니메이션 설정 */}
        <SettingItem
          title="애니메이션 효과"
          description="화면 전환 시 애니메이션을 사용합니다."
          type="toggle"
          value={true} // 임시 값, 실제로는 설정에서 가져와야 함
          onChange={(value: boolean) => {
            // TODO: 애니메이션 설정 구현
            console.log('애니메이션 설정:', value)
          }}
        />

        {/* 진동 피드백 */}
        <SettingItem
          title="진동 피드백"
          description="버튼 터치 시 진동 피드백을 제공합니다."
          type="toggle"
          value={true} // 임시 값
          onChange={(value: boolean) => {
            // TODO: 진동 설정 구현
            console.log('진동 피드백 설정:', value)
          }}
        />

        {/* 컴팩트 모드 */}
        <SettingItem
          title="컴팩트 모드"
          description="인터페이스 요소들을 더 조밀하게 표시합니다."
          type="toggle"
          value={false} // 임시 값
          onChange={(value: boolean) => {
            // TODO: 컴팩트 모드 설정 구현
            console.log('컴팩트 모드 설정:', value)
          }}
        />
      </div>

      {/* 설정 미리보기 */}
      <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">설정 미리보기</h4>
        <div className="text-sm text-primary-700">
          <p>테마: <span className="font-medium">{themeOptions.find(opt => opt.value === settings.theme)?.label}</span></p>
          <p>언어: <span className="font-medium">{languageOptions.find(opt => opt.value === settings.language)?.label}</span></p>
          <p>폰트: <span className="font-medium">{fontSizeOptions.find(opt => opt.value === settings.fontSize)?.label}</span></p>
          <p>대화 스타일: <span className="font-medium">{conversationStyleOptions.find(opt => opt.value === settings.conversationStyle)?.label}</span></p>
        </div>
      </div>

      {/* 초기화 버튼 */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <SettingItem
          title="기본값으로 되돌리기"
          description="개인화 설정을 모두 초기값으로 되돌립니다."
          type="button"
          onChange={() => {
            if (confirm('개인화 설정을 모두 초기값으로 되돌리시겠습니까?')) {
              updateSetting('theme', 'auto')
              updateSetting('language', 'ko')
              updateSetting('fontSize', 'medium')
              updateSetting('conversationStyle', 'casual')
            }
          }}
        />
      </div>
    </div>
  )
}