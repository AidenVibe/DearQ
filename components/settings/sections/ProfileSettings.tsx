'use client'

import React, { useState } from 'react'
import { useSettingsSection } from '@/contexts/SettingsContext'
import { SettingItem, SettingSection } from '../shared/SettingItem'

/**
 * 프로필 설정 섹션 컴포넌트
 * 사용자의 개인 프로필 정보를 관리합니다.
 */
export function ProfileSettings() {
  const { settings, updateSetting } = useSettingsSection('profile')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  if (!settings) {
    return (
      <div className="p-6 text-center">
        <div className="text-slate-500">프로필 설정을 불러오는 중...</div>
      </div>
    )
  }

  // 아바타 업로드 핸들러
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 형식 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    try {
      setIsUploadingAvatar(true)
      
      // 이미지를 Data URL로 변환
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        updateSetting('avatar', dataUrl)
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('아바타 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // 아바타 제거 핸들러
  const handleRemoveAvatar = () => {
    if (confirm('프로필 이미지를 제거하시겠습니까?')) {
      updateSetting('avatar', undefined)
    }
  }

  return (
    <div className="p-6">
      <SettingSection
        title="프로필"
        description="가족들에게 보여질 개인 정보를 관리하세요."
      />

      {/* 프로필 이미지 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-900 mb-3">프로필 이미지</h4>
        <div className="flex items-center space-x-4">
          <div className="relative">
            {settings.avatar ? (
              <img
                src={settings.avatar}
                alt="프로필 이미지"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {settings.displayName ? settings.displayName[0].toUpperCase() : '?'}
              </div>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="avatar-upload"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer text-center text-sm font-medium"
              style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
            >
              이미지 변경
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isUploadingAvatar}
              className="hidden"
            />
            
            {settings.avatar && (
              <button
                onClick={handleRemoveAvatar}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm font-medium"
                style={{ minHeight: '44px' }}
              >
                이미지 제거
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          권장 크기: 200x200px, 최대 5MB (JPG, PNG, GIF)
        </p>
      </div>

      {/* 표시 이름 */}
      <SettingItem
        title="표시 이름"
        description="가족들에게 보여질 이름입니다."
        type="input"
        value={settings.displayName}
        defaultValue="사용자"
        onChange={(value: string) => updateSetting('displayName', value.trim())}
      />

      {/* 상태 메시지 */}
      <SettingItem
        title="상태 메시지"
        description="현재 기분이나 상태를 간단히 표현해보세요."
        type="input"
        value={settings.statusMessage}
        defaultValue=""
        onChange={(value: string) => updateSetting('statusMessage', value.trim())}
      >
        <div className="mt-2 text-xs text-slate-500">
          최대 50자까지 입력할 수 있습니다. ({(settings.statusMessage || '').length}/50)
        </div>
      </SettingItem>

      {/* 생일 */}
      <SettingItem
        title="생일"
        description="생일을 등록하면 가족들이 축하 메시지를 보낼 수 있어요."
        type="date"
        value={settings.birthday}
        onChange={(value: string) => updateSetting('birthday', value)}
      />

      {/* 즐겨 사용하는 이모지 */}
      <SettingItem
        title="대표 이모지"
        description="나를 표현하는 이모지를 선택하세요."
        type="select"
        value={settings.favoriteEmoji}
        options={[
          { value: '😊', label: '😊 웃는 얼굴' },
          { value: '😄', label: '😄 활짝 웃음' },
          { value: '🥰', label: '🥰 사랑스러운' },
          { value: '😎', label: '😎 멋진' },
          { value: '🤗', label: '🤗 포옹' },
          { value: '😇', label: '😇 천사' },
          { value: '🌟', label: '🌟 별' },
          { value: '💝', label: '💝 선물' },
          { value: '🌸', label: '🌸 벚꽃' },
          { value: '🎵', label: '🎵 음악' }
        ]}
        onChange={(value: string) => updateSetting('favoriteEmoji', value)}
      />

      {/* 프로필 미리보기 */}
      <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">프로필 미리보기</h4>
        <div className="flex items-center space-x-3">
          {settings.avatar ? (
            <img
              src={settings.avatar}
              alt="미리보기"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
              {settings.displayName ? settings.displayName[0].toUpperCase() : '?'}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-900">
                {settings.displayName || '표시 이름 없음'}
              </span>
              <span className="text-lg">{settings.favoriteEmoji}</span>
            </div>
            {settings.statusMessage && (
              <p className="text-sm text-slate-600 mt-1">{settings.statusMessage}</p>
            )}
            {settings.birthday && (
              <p className="text-xs text-slate-500 mt-1">
                생일: {new Date(settings.birthday).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 text-sm">
            <p className="text-blue-800 font-medium">프로필 정보 보호</p>
            <p className="text-blue-700 mt-1">
              프로필 정보는 가족 구성원들에게만 공개됩니다. 
              외부로 공유되지 않으며, 언제든지 수정하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 프로필 삭제 */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <SettingItem
          title="프로필 초기화"
          description="프로필 정보를 모두 초기값으로 되돌립니다."
          type="button"
          onChange={() => {
            if (confirm('프로필 정보를 모두 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
              updateSetting('displayName', '')
              updateSetting('avatar', undefined)
              updateSetting('statusMessage', undefined)
              updateSetting('birthday', undefined)
              updateSetting('favoriteEmoji', '😊')
            }
          }}
        />
      </div>
    </div>
  )
}