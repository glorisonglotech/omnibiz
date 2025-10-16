# OmniBiz Storefront Multi-Configuration Testing Script
# This script sets up different configurations for testing the storefront

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OmniBiz Storefront Testing Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking server status..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    $serverRunning = $true
    Write-Host "✓ Server is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running" -ForegroundColor Red
    Write-Host "  Starting server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\server; npm run dev"
    Write-Host "  Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Client Configurations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration 1: Main Development (Port 5173)
Write-Host "Configuration 1: Main Development" -ForegroundColor Yellow
Write-Host "  Port: 5173" -ForegroundColor Gray
Write-Host "  URL: http://localhost:5173/store/TEST2025" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"
Write-Host "✓ Started on port 5173" -ForegroundColor Green
Start-Sleep -Seconds 3

# Configuration 2: Alternative Port (Port 5174)
Write-Host ""
Write-Host "Configuration 2: Alternative Port" -ForegroundColor Yellow
Write-Host "  Port: 5174" -ForegroundColor Gray
Write-Host "  URL: http://localhost:5174/store/TEST2025" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev -- --port 5174"
Write-Host "✓ Started on port 5174" -ForegroundColor Green
Start-Sleep -Seconds 3

# Configuration 3: Network Access
Write-Host ""
Write-Host "Configuration 3: Network Access" -ForegroundColor Yellow
Write-Host "  Getting local IP address..." -ForegroundColor Gray

$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress

if ($localIP) {
    Write-Host "  Local IP: $localIP" -ForegroundColor Gray
    Write-Host "  Network URL: http://${localIP}:5173/store/TEST2025" -ForegroundColor Gray
    Write-Host "  Use this URL on mobile/tablet devices" -ForegroundColor Cyan
} else {
    Write-Host "  Could not detect local IP" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Opening Test URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for clients to start
Write-Host "Waiting for clients to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open browsers with test URLs
Write-Host "Opening test URLs in browser..." -ForegroundColor Yellow

# Configuration 1 - Main
Start-Process "http://localhost:5173/store/TEST2025"
Write-Host "✓ Opened: http://localhost:5173/store/TEST2025" -ForegroundColor Green
Start-Sleep -Seconds 2

# Configuration 2 - Alternative
Start-Process "http://localhost:5174/store/TEST2025"
Write-Host "✓ Opened: http://localhost:5174/store/TEST2025" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Environment Ready!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Available Test URLs:" -ForegroundColor Yellow
Write-Host "  1. Desktop (Port 5173):  http://localhost:5173/store/TEST2025" -ForegroundColor White
Write-Host "  2. Desktop (Port 5174):  http://localhost:5174/store/TEST2025" -ForegroundColor White
if ($localIP) {
    Write-Host "  3. Mobile/Tablet:        http://${localIP}:5173/store/TEST2025" -ForegroundColor White
}
Write-Host ""

Write-Host "Test Scenarios:" -ForegroundColor Yellow
Write-Host "  • Guest Checkout (no login)" -ForegroundColor Gray
Write-Host "  • Registered User Checkout" -ForegroundColor Gray
Write-Host "  • Product Browsing & Search" -ForegroundColor Gray
Write-Host "  • Cart Management" -ForegroundColor Gray
Write-Host "  • Appointment Booking" -ForegroundColor Gray
Write-Host "  • Order History" -ForegroundColor Gray
Write-Host "  • Multi-device Testing" -ForegroundColor Gray
Write-Host ""

Write-Host "Test Invite Codes:" -ForegroundColor Yellow
Write-Host "  • TEST2025" -ForegroundColor White
Write-Host "  • DEMO2025" -ForegroundColor White
Write-Host "  • STORE001" -ForegroundColor White
Write-Host ""

Write-Host "Quick Actions:" -ForegroundColor Yellow
Write-Host "  • View products: Navigate to Shop tab" -ForegroundColor Gray
Write-Host "  • Make order: Add to cart → Checkout" -ForegroundColor Gray
Write-Host "  • Book appointment: Navigate to Appointments tab" -ForegroundColor Gray
Write-Host "  • View history: Navigate to Orders tab (requires login)" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to open testing documentation..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open testing guide
$docPath = "..\STOREFRONT_TESTING_GUIDE.md"
if (Test-Path $docPath) {
    Start-Process $docPath
    Write-Host "✓ Opened testing documentation" -ForegroundColor Green
} else {
    Write-Host "✗ Testing documentation not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Happy Testing! 🚀" -ForegroundColor Cyan
Write-Host ""
