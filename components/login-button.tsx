'use client'

import { Button } from './ui/button'

interface LoginButtonProps {
  className?: string
}

export function LoginButton({ className }: LoginButtonProps) {
  const handleLogin = () => {
    // 카카오 로그인 로직은 나중에 구현
    console.log('카카오 로그인 실행')
  }

  return (
    <Button
      onClick={handleLogin}
      className={`kakao-login min-h-[44px] bg-yellow-400 hover:bg-yellow-500 text-black font-medium ${className}`}
      size="lg"
      tabIndex={0}
    >
      카카오로 시작하기
    </Button>
  )
}