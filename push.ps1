[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "GitHub 원클릭 업로드 도우미"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🔥 중간고사 플래너 GitHub 업로드 도우미" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 웹 브라우저에서 https://github.com/new 에 접속하여 새 저장소를 만듭니다." -ForegroundColor White
Write-Host "2. 생성된 저장소의 HTTPS 주소를 복사합니다." -ForegroundColor Gray
Write-Host "   (예: https://github.com/아이디/exam-planner.git)" -ForegroundColor Gray
Write-Host ""

# Add VisualBasic assembly for GUI popup input box
Add-Type -AssemblyName Microsoft.VisualBasic

$repoUrl = [Microsoft.VisualBasic.Interaction]::InputBox(
    "복사한 GitHub 저장소 주소(HTTPS)를 붙여넣으세요:`n(예: https://github.com/아이디/exam-planner.git)",
    "GitHub 저장소 주소 입력",
    ""
)

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "주소가 입력되지 않아 취소되었습니다." -ForegroundColor Red
    Write-Host "창을 닫으려면 아무 키나 누르세요..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

$repoUrl = $repoUrl.Trim()

Write-Host ""
Write-Host "[1/3] 변경 사항 커밋 확인 중..." -ForegroundColor Green
git add .
git commit -m "feat: 중간고사 플래너 업데이트" 2>$null

Write-Host "[2/3] 원격 저장소 연결 중: $repoUrl" -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin $repoUrl
git branch -M main

Write-Host "[3/3] GitHub로 업로드(Push) 중..." -ForegroundColor Green
Write-Host "(처음 푸시하는 경우 GitHub 로그인 창이 뜰 수 있습니다)" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "🎉 GitHub에 성공적으로 업로드되었습니다!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "다음 단계: Vercel 배포" -ForegroundColor Yellow
    Write-Host "1. https://vercel.com 에 로그인합니다." -ForegroundColor White
    Write-Host "2. [Add New Project] 에서 방금 올린 저장소를 [Import] 합니다." -ForegroundColor White
    Write-Host "3. [Deploy] 버튼을 누르면 10초 만에 사이트가 배포됩니다!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️ 푸시 중 오류가 발생했습니다." -ForegroundColor Red
    Write-Host "- GitHub 로그인 권한 또는 주소가 올바른지 확인해주세요." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "창을 닫으려면 아무 키나 누르세요..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
