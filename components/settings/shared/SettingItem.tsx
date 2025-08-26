'use client'

import React, { ReactNode } from 'react'
import { SettingItemType } from '@/types/settings'

export interface SettingItemProps {
  title: string
  description?: string
  type: SettingItemType
  value?: any
  defaultValue?: any
  options?: Array<{ value: any; label: string; description?: string }>
  isEnabled?: boolean
  isVisible?: boolean
  requiresRestart?: boolean
  className?: string
  children?: ReactNode
  onChange?: (value: any) => void | Promise<void>
}

/**
 * 범용 설정 항목 컴포넌트
 * 다양한 타입의 설정 UI를 제공합니다.
 */
export function SettingItem({
  title,
  description,
  type,
  value,
  defaultValue,
  options = [],
  isEnabled = true,
  isVisible = true,
  requiresRestart = false,
  className = '',
  children,
  onChange
}: SettingItemProps) {
  
  if (!isVisible) return null

  const handleChange = (newValue: any) => {
    if (isEnabled && onChange) {
      onChange(newValue)
    }
  }

  const renderControl = () => {
    switch (type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={!isEnabled}
              className="sr-only"
            />
            <div className={`relative w-12 h-6 transition duration-200 ease-linear rounded-full ${
              value 
                ? 'bg-primary-600' 
                : 'bg-slate-300'
            } ${!isEnabled ? 'opacity-50' : ''}`}>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform duration-100 ease-linear ${
                value ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </label>
        )

      case 'select':
        return (
          <select
            value={value || defaultValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={!isEnabled}
            className={`px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              !isEnabled ? 'bg-slate-100 text-slate-500' : 'bg-white'
            }`}
            style={{ minHeight: '44px' }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'input':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={!isEnabled}
            className={`px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              !isEnabled ? 'bg-slate-100 text-slate-500' : 'bg-white'
            }`}
            style={{ minHeight: '44px' }}
            placeholder={defaultValue || ''}
          />
        )

      case 'slider':
        const min = options[0]?.value || 0
        const max = options[1]?.value || 100
        const step = options[2]?.value || 1
        
        return (
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value || defaultValue || min}
              onChange={(e) => handleChange(Number(e.target.value))}
              disabled={!isEnabled}
              className={`flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${
                !isEnabled ? 'opacity-50' : ''
              }`}
              style={{ minHeight: '44px' }}
            />
            <span className="text-sm text-slate-600 min-w-[3rem] text-right">
              {value || defaultValue || min}
            </span>
          </div>
        )

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value || defaultValue || '#000000'}
              onChange={(e) => handleChange(e.target.value)}
              disabled={!isEnabled}
              className={`w-12 h-12 rounded-md border border-slate-300 cursor-pointer ${
                !isEnabled ? 'opacity-50' : ''
              }`}
            />
            <span className="text-sm text-slate-600 font-mono">
              {value || defaultValue || '#000000'}
            </span>
          </div>
        )

      case 'time':
        return (
          <input
            type="time"
            value={value || defaultValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={!isEnabled}
            className={`px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              !isEnabled ? 'bg-slate-100 text-slate-500' : 'bg-white'
            }`}
            style={{ minHeight: '44px' }}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || defaultValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={!isEnabled}
            className={`px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              !isEnabled ? 'bg-slate-100 text-slate-500' : 'bg-white'
            }`}
            style={{ minHeight: '44px' }}
          />
        )

      case 'button':
        return (
          <button
            onClick={() => handleChange(null)}
            disabled={!isEnabled}
            className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              !isEnabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ minHeight: '44px' }}
          >
            {title}
          </button>
        )

      case 'link':
        return (
          <button
            onClick={() => handleChange(value)}
            disabled={!isEnabled}
            className={`flex items-center text-primary-600 hover:text-primary-800 ${
              !isEnabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ minHeight: '44px' }}
          >
            <span>{title}</span>
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )

      case 'section':
        return null

      default:
        return <div className="text-slate-400">지원하지 않는 설정 타입</div>
    }
  }

  // 섹션 헤더인 경우
  if (type === 'section') {
    return (
      <div className={`border-b border-slate-200 pb-2 mb-4 ${className}`}>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        )}
        {children}
      </div>
    )
  }

  return (
    <div className={`setting-item py-4 border-b border-slate-100 last:border-b-0 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-slate-900">{title}</h4>
            {requiresRestart && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                재시작 필요
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
          {children}
        </div>
        
        <div className="flex-shrink-0">
          {renderControl()}
        </div>
      </div>
    </div>
  )
}

// 편의 컴포넌트들
export function SettingToggle(props: Omit<SettingItemProps, 'type'>) {
  return <SettingItem {...props} type="toggle" />
}

export function SettingSelect(props: Omit<SettingItemProps, 'type'>) {
  return <SettingItem {...props} type="select" />
}

export function SettingInput(props: Omit<SettingItemProps, 'type'>) {
  return <SettingItem {...props} type="input" />
}

export function SettingSlider(props: Omit<SettingItemProps, 'type'>) {
  return <SettingItem {...props} type="slider" />
}

export function SettingButton(props: Omit<SettingItemProps, 'type'>) {
  return <SettingItem {...props} type="button" />
}

export function SettingSection(props: Omit<SettingItemProps, 'type'>) {
  return <SettingItem {...props} type="section" />
}