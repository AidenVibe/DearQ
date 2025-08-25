import { render, screen } from '@testing-library/react'
import { LoginButton } from '@/components/login-button'

// TDD Red 단계 - 실패하는 테스트 작성
describe('LoginButton', () => {
  it('카카오 로그인 버튼이 렌더링되어야 한다', () => {
    render(<LoginButton />)
    
    const loginButton = screen.getByRole('button', { 
      name: /카카오로 시작하기/i 
    })
    expect(loginButton).toBeInTheDocument()
  })

  it('버튼에 카카오 브랜드 스타일이 적용되어야 한다', () => {
    render(<LoginButton />)
    
    const loginButton = screen.getByRole('button', { 
      name: /카카오로 시작하기/i 
    })
    
    // 카카오 브랜드 컬러나 스타일이 적용되었는지 확인
    expect(loginButton).toHaveClass('kakao-login')
  })

  it('44px 이상의 터치 타겟을 가져야 한다 (접근성)', () => {
    render(<LoginButton />)
    
    const loginButton = screen.getByRole('button', { 
      name: /카카오로 시작하기/i 
    })
    
    // min-h-[44px] 클래스가 적용되었는지 확인 (실제 높이는 E2E 테스트에서 검증)
    expect(loginButton).toHaveClass(/min-h-\[44px\]/)
  })

  it('키보드 포커스가 가능해야 한다 (접근성)', () => {
    render(<LoginButton />)
    
    const loginButton = screen.getByRole('button', { 
      name: /카카오로 시작하기/i 
    })
    
    // Tab으로 포커스 이동 가능
    expect(loginButton).toHaveProperty('tabIndex', 0)
  })
})