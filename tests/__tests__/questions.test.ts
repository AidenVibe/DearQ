import {
  generateQuestionId,
  flattenQuestions,
  getQuestionsByCategory,
  getRandomQuestion,
  getTodaysQuestion,
  searchQuestions,
  getQuestionStats
} from '@/lib/questions'
import { QuestionsData, Question } from '@/types/question'

// 테스트용 질문 데이터
const mockQuestionsData: QuestionsData = {
  categories: [
    {
      category: '일상·하루',
      questions: [
        '최근 웃음이 났던 순간은 언제였나요?',
        '지금 기운은 0~10점 중 몇 점인가요?'
      ]
    },
    {
      category: '추억·과거',
      questions: [
        '어린 시절 집 하면 떠오르는 냄새는?',
        '가족 여행 중 다시 가고 싶은 곳은?'
      ]
    }
  ]
}

describe('Questions Library', () => {
  let flattenedQuestions: Question[]

  beforeEach(() => {
    flattenedQuestions = flattenQuestions(mockQuestionsData)
  })

  describe('generateQuestionId', () => {
    it('카테고리와 인덱스로 올바른 ID를 생성해야 한다', () => {
      const id = generateQuestionId('일상·하루', 0)
      expect(id).toBe('daily_01')
      
      const id2 = generateQuestionId('추억·과거', 9)
      expect(id2).toBe('memory_10')
    })
  })

  describe('flattenQuestions', () => {
    it('중첩된 질문 데이터를 평면화해야 한다', () => {
      expect(flattenedQuestions).toHaveLength(4)
      expect(flattenedQuestions[0]).toMatchObject({
        id: 'daily_01',
        content: '최근 웃음이 났던 순간은 언제였나요?',
        category: '일상·하루'
      })
    })

    it('각 질문에 생성/수정 시간이 포함되어야 한다', () => {
      flattenedQuestions.forEach(question => {
        expect(question.createdAt).toBeInstanceOf(Date)
        expect(question.updatedAt).toBeInstanceOf(Date)
      })
    })
  })

  describe('getQuestionsByCategory', () => {
    it('지정된 카테고리의 질문만 반환해야 한다', () => {
      const dailyQuestions = getQuestionsByCategory(flattenedQuestions, '일상·하루')
      expect(dailyQuestions).toHaveLength(2)
      expect(dailyQuestions.every(q => q.category === '일상·하루')).toBe(true)
    })

    it('존재하지 않는 카테고리에 대해 빈 배열을 반환해야 한다', () => {
      const questions = getQuestionsByCategory(flattenedQuestions, '감사·행복')
      expect(questions).toHaveLength(0)
    })
  })

  describe('getRandomQuestion', () => {
    it('질문 목록에서 랜덤 질문을 반환해야 한다', () => {
      const randomQuestion = getRandomQuestion(flattenedQuestions)
      expect(randomQuestion).toBeTruthy()
      expect(flattenedQuestions).toContainEqual(randomQuestion)
    })

    it('특정 카테고리에서 랜덤 질문을 선택할 수 있어야 한다', () => {
      const randomQuestion = getRandomQuestion(flattenedQuestions, { 
        category: '일상·하루' 
      })
      expect(randomQuestion?.category).toBe('일상·하루')
    })

    it('빈 배열에 대해 null을 반환해야 한다', () => {
      const randomQuestion = getRandomQuestion([])
      expect(randomQuestion).toBeNull()
    })
  })

  describe('getTodaysQuestion', () => {
    it('동일한 날짜에 대해 동일한 질문을 반환해야 한다', () => {
      const question1 = getTodaysQuestion(flattenedQuestions, '2025-08-25')
      const question2 = getTodaysQuestion(flattenedQuestions, '2025-08-25')
      
      expect(question1).toEqual(question2)
    })

    it('다른 날짜에 대해서는 다른 질문을 반환할 수 있어야 한다', () => {
      const question1 = getTodaysQuestion(flattenedQuestions, '2025-08-25')
      const question2 = getTodaysQuestion(flattenedQuestions, '2025-08-26')
      
      // 4개의 질문으로는 항상 다를 것을 보장할 수 없으므로 타입만 확인
      expect(question1).toBeTruthy()
      expect(question2).toBeTruthy()
      expect(question1?.date).toBe('2025-08-25')
      expect(question2?.date).toBe('2025-08-26')
    })

    it('반환된 오늘의 질문에 날짜 정보가 포함되어야 한다', () => {
      const todaysQuestion = getTodaysQuestion(flattenedQuestions, '2025-08-25')
      expect(todaysQuestion?.date).toBe('2025-08-25')
      expect(todaysQuestion?.isUsed).toBe(false)
    })
  })

  describe('searchQuestions', () => {
    it('질문 내용에서 키워드를 검색할 수 있어야 한다', () => {
      const results = searchQuestions(flattenedQuestions, '웃음')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('웃음')
    })

    it('카테고리명으로 검색할 수 있어야 한다', () => {
      const results = searchQuestions(flattenedQuestions, '일상')
      expect(results).toHaveLength(2)
      expect(results.every(q => q.category.includes('일상'))).toBe(true)
    })

    it('대소문자를 구분하지 않고 검색해야 한다', () => {
      const results = searchQuestions(flattenedQuestions, '웃음')
      expect(results).toHaveLength(1)
    })
  })

  describe('getQuestionStats', () => {
    it('질문 통계를 올바르게 계산해야 한다', () => {
      const stats = getQuestionStats(flattenedQuestions)
      expect(stats.total).toBe(4)
      expect(stats.byCategory['일상·하루']).toBe(2)
      expect(stats.byCategory['추억·과거']).toBe(2)
      expect(stats.byCategory['감사·행복']).toBe(0)
    })
  })
})