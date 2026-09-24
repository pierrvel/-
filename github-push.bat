@echo off
chcp 65001 > nul
title GitHub 푸시 도우미
echo ========================================================
echo 🔥 GitHub 저장소 연결 및 푸시
echo ========================================================
echo.
echo [안내] 
echo 1. https://github.com/new 에 접속하여 새 저장소(Repository)를 만듭니다.
echo 2. 생성된 저장소의 HTTPS 주소를 복사합니다. (예: https://github.com/내아이디/내저장소.git)
echo.
set /p REPO_URL="👉 복사한 GitHub 저장소 주소를 붙여넣고 엔터를 누르세요: "

if "%REPO_URL%"=="" (
    echo.
    echo 주소가 입력되지 않았습니다. 종료합니다.
    pause
    exit /b
)

echo.
echo [1/3] 변경 사항 추가 및 커밋 중...
git add .
git commit -m "update: planner update" > nul 2>&1

echo [2/3] 원격 저장소 연결 중...
git remote remove origin > nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo [3/3] GitHub로 업로드(푸시) 중...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo 🎉 GitHub에 성공적으로 업로드되었습니다!
    echo ========================================================
    echo.
    echo 이제 Vercel(https://vercel.com)에 로그인 후 [Add New Project]에서
    echo 방금 올린 저장소를 선택하고 [Deploy]를 누르면 배포가 완료됩니다!
) else (
    echo.
    echo ⚠️ 푸시 중 오류가 발생했습니다. GitHub 로그인 상태나 주소를 확인해주세요.
)

echo.
pause
