import { 
  Question, 
  QuestionCategory, 
  QuestionsData, 
  TodaysQuestion,
  QuestionSelectionOptions 
} from '@/types/question'

// 질문 데이터를 JSON 파일에서 로드
export async function loadQuestionsData(): Promise<QuestionsData> {
  // 개발 단계에서는 static import 사용
  const data = await import('@/data/questions.json')
  return data.default as QuestionsData
}

// 질문 ID 생성 (카테고리_인덱스 형태)
export function generateQuestionId(category: QuestionCategory, index: number): string {
  const categoryCode = getCategoryCode(category)
  return `${categoryCode}_${String(index + 1).padStart(2, '0')}`
}

// 카테고리 코드 생성
function getCategoryCode(category: QuestionCategory): string {
  const categoryMap: Record<QuestionCategory, string> = {
    '일상·하루': 'daily',
    '추억·과거': 'memory',
    '가족·관계': 'family',
    '감사·행복': 'gratitude',
    '취향·취미': 'hobby',
    '음식·요리': 'food',
    '배움·호기심': 'learning',
    '계절·날씨·장소': 'season',
    '미래·꿈·계획': 'future',
    '위로·응원·자기돌봄': 'comfort'
  }
  return categoryMap[category]
}

// 평면화된 질문 배열 생성
export function flattenQuestions(questionsData: QuestionsData): Question[] {
  const questions: Question[] = []
  
  questionsData.categories.forEach(categoryGroup => {
    categoryGroup.questions.forEach((questionContent, index) => {
      questions.push({
        id: generateQuestionId(categoryGroup.category, index),
        content: questionContent,
        category: categoryGroup.category,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })
  })
  
  return questions
}

// 카테고리별 질문 필터링
export function getQuestionsByCategory(
  questions: Question[], 
  category: QuestionCategory
): Question[] {
  return questions.filter(q => q.category === category)
}

// 랜덤 질문 선택
export function getRandomQuestion(
  questions: Question[], 
  options: Partial<QuestionSelectionOptions> = {}
): Question | null {
  let filteredQuestions = [...questions]
  
  if (options.category) {
    filteredQuestions = getQuestionsByCategory(filteredQuestions, options.category)
  }
  
  if (filteredQuestions.length === 0) {
    return null
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
  return filteredQuestions[randomIndex]
}

// 오늘의 질문 생성 (날짜 기반 시드)
export function getTodaysQuestion(
  questions: Question[],
  date: string = new Date().toISOString().split('T')[0]
): TodaysQuestion | null {
  if (questions.length === 0) return null
  
  // 날짜를 시드로 사용하여 동일한 날짜에는 동일한 질문 반환
  const seed = dateToSeed(date)
  const index = seed % questions.length
  const question = questions[index]
  
  return {
    ...question,
    date,
    isUsed: false
  }
}

// 날짜를 숫자 시드로 변환
function dateToSeed(date: string): number {
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  
  // 간단한 해시 함수로 시드 생성
  return (year * 10000 + month * 100 + day) % 2147483647
}

// 질문 검색
export function searchQuestions(
  questions: Question[], 
  query: string
): Question[] {
  const lowercaseQuery = query.toLowerCase()
  return questions.filter(question => 
    question.content.toLowerCase().includes(lowercaseQuery) ||
    question.category.toLowerCase().includes(lowercaseQuery)
  )
}

// 카테고리별 질문 통계
export function getQuestionStats(questions: Question[]) {
  const stats: Record<QuestionCategory, number> = {
    '일상·하루': 0,
    '추억·과거': 0,
    '가족·관계': 0,
    '감사·행복': 0,
    '취향·취미': 0,
    '음식·요리': 0,
    '배움·호기심': 0,
    '계절·날씨·장소': 0,
    '미래·꿈·계획': 0,
    '위로·응원·자기돌봄': 0
  }
  
  questions.forEach(question => {
    stats[question.category]++
  })
  
  return {
    total: questions.length,
    byCategory: stats
  }
}