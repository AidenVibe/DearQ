'use client'

import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

interface LoginButtonProps {
  className?: string
}

export function LoginButton({ className }: LoginButtonProps) {
  const router = useRouter()
  
  const handleLogin = async () => {
    // TODO: 실제 카카오 로그인 로직으로 교체 예정
    console.log('카카오 로그인 실행 - 임시 인증 처리')
    
    // 임시 사용자 정보 localStorage에 저장
    const tempUser = {
      id: 'user-temp-001',
      name: '김민수',
      email: 'minsu@example.com',
      avatar: '👨‍💼',
      loginAt: new Date().toISOString()
    }
    
    try {
      localStorage.setItem('dearq_user', JSON.stringify(tempUser))
      console.log('임시 사용자 인증 완료:', tempUser.name)
      
      // 홈 화면으로 이동
      router.push('/home')
    } catch (error) {
      console.error('로그인 처리 중 오류:', error)
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
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