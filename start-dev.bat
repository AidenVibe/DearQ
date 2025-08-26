@echo off
echo 마음배달 (DearQ) 개발 서버를 시작합니다...
echo.

cd /d "%~dp0"

REM 의존성 설치 확인
if not exist "node_modules" (
    echo node_modules 폴더가 없습니다. 의존성을 설치합니다...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
    echo.
)

echo 개발 서버를 시작합니다...
echo 접속 주소: http://localhost:3010 (포트 3010 사용)
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.

set PORT=3010
call npm run dev

pause