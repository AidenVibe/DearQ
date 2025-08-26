export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마음배달</h1>
          <p className="text-gray-600">
            로그인 중입니다...
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            {/* 로딩 스피너 */}
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            
            {/* 로딩 메시지 */}
            <p className="text-sm text-gray-600">
              카카오 로그인을 처리하고 있어요
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}