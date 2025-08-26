"use client"

import { Button } from "@/components/ui/button"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CSS 테스트 페이지
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Tailwind CSS가 적용되었다면 이 텍스트가 스타일링되어 보입니다.
          </p>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
            테스트 버튼
          </Button>
        </div>
      </div>
    </div>
  )
}