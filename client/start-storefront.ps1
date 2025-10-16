# Start OmniBiz Storefront on Port 5174
# This script starts the client storefront on a different port

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OmniBiz Storefront Client" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✓ Backend server is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend server is not running!" -ForegroundColor Red
    Write-Host "  Please start the server first:" -ForegroundColor Yellow
    Write-Host "  cd ..\server" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

Write-Host ""
Write-Host "Starting Storefront Client..." -ForegroundColor Yellow
Write-Host "  Port: 5174" -ForegroundColor Gray
Write-Host "  HMR Port: 5175" -ForegroundColor Gray
Write-Host "  Config: vite.config.storefront.js" -ForegroundColor Gray
Write-Host ""

# Get local IP for network access
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress

Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Local:   http://localhost:5174/store/YOUR_INVITE_CODE" -ForegroundColor White
if ($localIP) {
    Write-Host "  Network: http://${localIP}:5174/store/YOUR_INVITE_CODE" -ForegroundColor White
    Write-Host "  (Use network URL for mobile/tablet testing)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Example URLs:" -ForegroundColor Yellow
Write-Host "  http://localhost:5174/store/TEST2025" -ForegroundColor Gray
Write-Host "  http://localhost:5174/store/DEMO2025" -ForegroundColor Gray
Write-Host ""

Write-Host "Features Available:" -ForegroundColor Yellow
Write-Host "  ✓ Product browsing & search" -ForegroundColor Green
Write-Host "  ✓ Shopping cart" -ForegroundColor Green
Write-Host "  ✓ Guest checkout" -ForegroundColor Green
Write-Host "  ✓ User checkout" -ForegroundColor Green
Write-Host "  ✓ Appointment booking" -ForegroundColor Green
Write-Host "  ✓ Order history" -ForegroundColor Green
Write-Host "  ✓ Live AI chat" -ForegroundColor Green
Write-Host ""

Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host ""

# Start the storefront
npm run dev:storefront
