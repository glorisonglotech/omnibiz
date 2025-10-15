# Clear Vite Cache Script
# Run this script to clear Vite cache and fix module loading issues

Write-Host ""
Write-Host "🧹 Clearing Vite Cache..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Clear node_modules/.vite folder
$vitePath = ".\node_modules\.vite"
if (Test-Path $vitePath) {
    Remove-Item -Recurse -Force $vitePath
    Write-Host "✅ Vite cache cleared successfully!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Vite cache found (already clean)" -ForegroundColor Yellow
}

# Clear dev-dist folder
$devDistPath = ".\dev-dist"
if (Test-Path $devDistPath) {
    Remove-Item -Recurse -Force $devDistPath
    Write-Host "✅ dev-dist folder cleared!" -ForegroundColor Green
}

# Clear dist folder
$distPath = ".\dist"
if (Test-Path $distPath) {
    Remove-Item -Recurse -Force $distPath
    Write-Host "✅ dist folder cleared!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Unregister service workers (F12 → Application → Service Workers)" -ForegroundColor White
Write-Host "3. Run: pnpm run dev" -ForegroundColor White
Write-Host ""
Write-Host "✨ Done! Your cache is clean." -ForegroundColor Green
Write-Host ""
