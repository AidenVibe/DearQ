export default function HistoryLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">대화 히스토리</h1>
        <p className="text-gray-600">
          대화 내역을 불러오고 있어요...
        </p>
      </header>

      <div className="space-y-4">
        {/* 스켈레톤 로더 */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}