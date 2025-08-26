export default function ReceiveTokenLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마음배달</h1>
          <p className="text-gray-600">
            질문을 불러오고 있어요...
          </p>
        </header>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="animate-pulse">
            {/* 질문 카드 스켈레톤 */}
            <div className="mb-6">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* 보낸 사람 정보 스켈레톤 */}
            <div className="mb-6">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>

            {/* 답변 입력 영역 스켈레톤 */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-11 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}