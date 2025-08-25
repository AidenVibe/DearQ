// 질문 카테고리 타입
export type QuestionCategory = 
  | '일상·하루'
  | '추억·과거' 
  | '가족·관계'
  | '감사·행복'
  | '취향·취미'
  | '음식·요리'
  | '배움·호기심'
  | '계절·날씨·장소'
  | '미래·꿈·계획'
  | '위로·응원·자기돌봄'

// 개별 질문 인터페이스
export interface Question {
  id: string
  content: string
  category: QuestionCategory
  createdAt?: Date
  updatedAt?: Date
}

// 카테고리별 질문 그룹
export interface QuestionCategoryGroup {
  category: QuestionCategory
  questions: string[]
}

// 질문 전체 데이터 구조
export interface QuestionsData {
  categories: QuestionCategoryGroup[]
}

// 오늘의 질문 인터페이스
export interface TodaysQuestion extends Question {
  date: string // YYYY-MM-DD 형식
  isUsed?: boolean
}

// 질문 선택 전략
export type QuestionSelectionStrategy = 'random' | 'sequential' | 'category-based'

// 질문 선택 옵션
export interface QuestionSelectionOptions {
  strategy: QuestionSelectionStrategy
  category?: QuestionCategory
  excludeUsed?: boolean
  date?: string
}