# Start Both Dashboard and Storefront Simultaneously
# Dashboard on Port 5173, Storefront on Port 5174

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OmniBiz - Dual Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✓ Backend server is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend server is not running!" -ForegroundColor Red
    Write-Host "  Starting backend server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\server; npm run dev"
    Write-Host "  Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Client Applications" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Dashboard (Admin/Owner)" -ForegroundColor Cyan
Write-Host "    Port: 5173" -ForegroundColor Gray
Write-Host "    URL:  http://localhost:5173" -ForegroundColor White
Write-Host "    For:  Business owners, admins, staff" -ForegroundColor Gray
Write-Host ""
Write-Host "  Storefront (Invited Clients)" -ForegroundColor Cyan
Write-Host "    Port: 5174" -ForegroundColor Gray
Write-Host "    URL:  http://localhost:5174/store/INVITE_CODE" -ForegroundColor White
Write-Host "    For:  Customers, clients, guests" -ForegroundColor Gray
if ($localIP) {
    Write-Host "    Network: http://${localIP}:5174/store/INVITE_CODE" -ForegroundColor White
}
Write-Host ""

Write-Host "Example Storefront URLs:" -ForegroundColor Yellow
Write-Host "  http://localhost:5174/store/TEST2025" -ForegroundColor Gray
Write-Host "  http://localhost:5174/store/DEMO2025" -ForegroundColor Gray
Write-Host ""

Write-Host "Starting both applications..." -ForegroundColor Cyan
Write-Host "  This will open two terminal windows" -ForegroundColor Gray
Write-Host ""

Start-Sleep -Seconds 2

# Start Dashboard (Port 5173)
Write-Host "Starting Dashboard on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev:dashboard"
Start-Sleep -Seconds 3

# Start Storefront (Port 5174)
Write-Host "Starting Storefront on port 5174..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev:storefront"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Waiting for applications to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Opening Applications" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Open Dashboard
Write-Host "Opening Dashboard..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
Start-Sleep -Seconds 2

# Open Storefront
Write-Host "Opening Storefront..." -ForegroundColor Yellow
Start-Process "http://localhost:5174/store/TEST2025"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Systems Running!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Active Services:" -ForegroundColor Yellow
Write-Host "  ✓ Backend Server:  http://localhost:5000" -ForegroundColor Green
Write-Host "  ✓ Dashboard:       http://localhost:5173" -ForegroundColor Green
Write-Host "  ✓ Storefront:      http://localhost:5174/store/CODE" -ForegroundColor Green
Write-Host ""

Write-Host "Testing Scenarios:" -ForegroundColor Yellow
Write-Host "  1. Admin Login:    http://localhost:5173/loginpage" -ForegroundColor White
Write-Host "  2. Guest Shopping: http://localhost:5174/store/TEST2025" -ForegroundColor White
Write-Host "  3. User Shopping:  Login first, then visit storefront" -ForegroundColor White
Write-Host ""

Write-Host "Quick Actions:" -ForegroundColor Yellow
Write-Host "  • Manage products in Dashboard" -ForegroundColor Gray
Write-Host "  • View products in Storefront" -ForegroundColor Gray
Write-Host "  • Test orders from Storefront" -ForegroundColor Gray
Write-Host "  • View orders in Dashboard" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
