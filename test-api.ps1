# Alert Management System - Test Script

Write-Host "=== Testing Alert Management System ===" -ForegroundColor Cyan

# 1. Test Authentication
Write-Host "`n1. Testing Authentication..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@example.com","password":"password123"}' -ErrorAction Stop
    $token = $loginResponse.token
    Write-Host "✓ Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Test Alert Creation
Write-Host "`n2. Creating test alert..." -ForegroundColor Yellow
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$alertBody = @{
    sourceType = "sensor"
    severity = "HIGH"
    message = "Test alert from verification script"
    timestamp = $timestamp
    metadata = @{
        driverId = "driver123"
        location = "Zone A"
    }
}
$jsonBody = $alertBody | ConvertTo-Json

try {
    $alertResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/alerts" -Method POST -ContentType "application/json" -Body $jsonBody -ErrorAction Stop
    Write-Host "✓ Alert created successfully!" -ForegroundColor Green
    Write-Host "  Alert ID: $($alertResponse.id)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Alert creation failed: $_" -ForegroundColor Red
}

# 3. Test Dashboard Summary
Write-Host "`n3. Fetching dashboard summary..." -ForegroundColor Yellow
try {
    $summary = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/summary" -Method GET -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "✓ Dashboard summary retrieved!" -ForegroundColor Green
    Write-Host "  Status counts:" -ForegroundColor Gray
    $summary.byStatus.PSObject.Properties | ForEach-Object {
        Write-Host "    $($_.Name): $($_.Value)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Dashboard summary failed: $_" -ForegroundColor Red
}

Write-Host "=== Tests Completed ===" -ForegroundColor Cyan
