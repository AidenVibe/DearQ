"use client"

import { LoginButton } from "@/components/login-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/home'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마음배달</h1>
          <p className="text-gray-600">
            매일 하나의 질문으로 가족의 마음을 배달합니다
          </p>
        </div>

        {/* 로그인 카드 */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">
              시작하기
            </CardTitle>
            <p className="text-sm text-gray-600">
              가족과의 소중한 대화를 시작해보세요
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <LoginButton 
              returnTo={returnTo}
              className="w-full min-h-[44px]"
            />
            
            <p className="text-xs text-gray-500 text-center">
              로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          </CardContent>
        </Card>

        {/* 서비스 특징 */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            <span>매일 새로운 질문으로 자연스러운 대화 시작</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            <span>가족 구성원과 안전한 1:1 대화</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            <span>소중한 대화 기록을 영구 보관</span>
          </div>
        </div>
      </div>
    </div>
  )
}