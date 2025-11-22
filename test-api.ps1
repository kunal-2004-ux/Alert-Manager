# Alert Management System - Test Script

Write-Host "=== Testing Alert Management System ===" -ForegroundColor Cyan

# 1. Test Authentication
Write-Host "`n1. Testing Authentication..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@example.com","password":"password123"}'

$token = $loginResponse.token
Write-Host "✓ Login successful! Token received." -ForegroundColor Green

# 2. Test Alert Creation
Write-Host "`n2. Creating test alert..." -ForegroundColor Yellow
$alertBody = @{
    sourceType = "sensor"
    severity = "HIGH"
    message = "Test alert from verification script"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    metadata = @{
        driverId = "driver123"
        location = "Zone A"
    }
} | ConvertTo-Json

try {
    $alertResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/alerts" `
        -Method POST `
        -ContentType "application/json" `
        -Body $alertBody
    Write-Host "✓ Alert created successfully!" -ForegroundColor Green
    Write-Host "  Alert ID: $($alertResponse.id)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Alert creation failed: $_" -ForegroundColor Red
}

# 3. Test Dashboard Summary
Write-Host "`n3. Fetching dashboard summary..." -ForegroundColor Yellow
$summary = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/summary" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}

Write-Host "✓ Dashboard summary retrieved!" -ForegroundColor Green
Write-Host "  Status counts:" -ForegroundColor Gray
$summary.byStatus.PSObject.Properties | ForEach-Object {
    Write-Host "    $($_.Name): $($_.Value)" -ForegroundColor Gray
}

# 4. Test Leaderboard
Write-Host "`n4. Fetching leaderboard..." -ForegroundColor Yellow
$leaderboard = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/leaderboard" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}

Write-Host "✓ Leaderboard retrieved!" -ForegroundColor Green
Write-Host "  Top drivers: $($leaderboard.Count)" -ForegroundColor Gray

# 5. Test Trends
Write-Host "`n5. Fetching trends..." -ForegroundColor Yellow
$trends = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/trends" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}

Write-Host "✓ Trends retrieved!" -ForegroundColor Green
Write-Host "  Data points: $($trends.Count)" -ForegroundColor Gray

# 6. Test Events
Write-Host "`n6. Fetching recent events..." -ForegroundColor Yellow
$events = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/events" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}

Write-Host "✓ Events retrieved!" -ForegroundColor Green
Write-Host "  Recent events: $($events.Count)" -ForegroundColor Gray

Write-Host "`n=== All Tests Completed! ===" -ForegroundColor Cyan
Write-Host "`nYou can now access the frontend at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Login with: admin@example.com / password123" -ForegroundColor Yellow
