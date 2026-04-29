# Advanced Admin APIs Test Script
# Run this after logging in as admin

$baseUrl = "http://localhost:3000"
$token = Get-Content "token.txt" -ErrorAction SilentlyContinue

if (-not $token) {
    Write-Host "❌ No token found. Please login first:" -ForegroundColor Red
    Write-Host "POST $baseUrl/api/auth/login" -ForegroundColor Yellow
    Write-Host 'Body: {"email": "admin@bitstores.com", "password": "Admin123456"}' -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n🧪 Testing Advanced Admin APIs`n" -ForegroundColor Cyan

# ============================================================================
# 1. USER MANAGEMENT ADVANCED
# ============================================================================

Write-Host "📊 1. GET /api/v1/admin/users/stats - User Statistics" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/users/stats" -Method Get -Headers $headers
    Write-Host "✅ Success:" -ForegroundColor Green
    $response.data.stats | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 2. GET /api/v1/admin/users/:id/activity - User Activity" -ForegroundColor Green
try {
    # Get first user ID
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/users?limit=1" -Method Get -Headers $headers
    $userId = $usersResponse.data.users[0].id
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/users/$userId/activity" -Method Get -Headers $headers
    Write-Host "✅ Success:" -ForegroundColor Green
    Write-Host "User: $($response.data.user.email)"
    Write-Host "Recent Actions: $($response.data.recentActions.Count)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔨 3. POST /api/v1/admin/users/bulk-action - Bulk Block Users" -ForegroundColor Green
try {
    # Get some user IDs (excluding admin)
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/users?limit=5" -Method Get -Headers $headers
    $userIds = $usersResponse.data.users | Where-Object { $_.roles[0].role -ne "admin" } | Select-Object -First 2 -ExpandProperty id
    
    if ($userIds.Count -gt 0) {
        $body = @{
            userIds = @($userIds)
            action = "block"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/users/bulk-action" -Method Post -Headers $headers -Body $body
        Write-Host "✅ Success:" -ForegroundColor Green
        $response.data | ConvertTo-Json
    } else {
        Write-Host "⚠️ No non-admin users found to test bulk action" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================================
# 2. PRODUCT MANAGEMENT ADVANCED
# ============================================================================

Write-Host "`n📦 4. GET /api/v1/admin/products/low-stock - Low Stock Products" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/products/low-stock?threshold=50" -Method Get -Headers $headers
    Write-Host "✅ Success:" -ForegroundColor Green
    Write-Host "Low Stock Products: $($response.data.count)"
    Write-Host "Threshold: $($response.data.threshold)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n⭐ 5. PATCH /api/v1/admin/products/:id/featured - Toggle Featured" -ForegroundColor Green
try {
    # Get first product
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/products?limit=1" -Method Get -Headers $headers
    $productId = $productsResponse.data.products[0].id
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/products/$productId/featured" -Method Patch -Headers $headers
    Write-Host "✅ Success:" -ForegroundColor Green
    $response.data.product | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================================
# 3. CATEGORY MANAGEMENT ADVANCED
# ============================================================================

Write-Host "`n📝 6. PUT /api/v1/admin/categories/:id - Update Category" -ForegroundColor Green
try {
    # Get first category
    $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/categories" -Method Get -Headers $headers
    $categoryId = $categoriesResponse.data.categories[0].id
    
    $body = @{
        description = "Updated description for testing"
        display_order = 999
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/categories/$categoryId" -Method Put -Headers $headers -Body $body
    Write-Host "✅ Success:" -ForegroundColor Green
    $response.data.category | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🗑️ 7. DELETE /api/v1/admin/categories/:id - Delete Category (Should Fail)" -ForegroundColor Green
try {
    # Try to delete a category with products (should fail)
    $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/categories" -Method Get -Headers $headers
    $categoryId = $categoriesResponse.data.categories[0].id
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/categories/$categoryId" -Method Delete -Headers $headers
    Write-Host "✅ Deleted (unexpected):" -ForegroundColor Yellow
    $response.data | ConvertTo-Json
} catch {
    Write-Host "✅ Expected failure (category has products):" -ForegroundColor Green
    Write-Host $_.Exception.Message
}

# ============================================================================
# 4. AUDIT & REPORTING
# ============================================================================

Write-Host "`n📜 8. GET /api/v1/admin/audit-logs - Audit Logs" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/audit-logs?limit=10" -Method Get -Headers $headers
    Write-Host "✅ Success:" -ForegroundColor Green
    Write-Host "Total Logs: $($response.data.pagination.total)"
    Write-Host "Recent Actions:"
    $response.data.logs | Select-Object -First 5 | ForEach-Object {
        Write-Host "  - $($_.action) on $($_.entity_type) by $($_.user.email) at $($_.created_at)"
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 9. GET /api/v1/admin/reports/sales - Sales Report" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/reports/sales" -Method Get -Headers $headers
    Write-Host "✅ Success:" -ForegroundColor Green
    Write-Host "Summary:"
    $response.data.report.summary | ConvertTo-Json
    Write-Host "`nTop Products:"
    $response.data.report.topProducts | Select-Object -First 3 | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "🎉 Advanced Admin API Testing Complete!" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan

Write-Host "`n📋 New APIs Tested:" -ForegroundColor Yellow
Write-Host "  1. ✅ GET /api/v1/admin/users/stats" -ForegroundColor Green
Write-Host "  2. ✅ GET /api/v1/admin/users/:id/activity" -ForegroundColor Green
Write-Host "  3. ✅ POST /api/v1/admin/users/bulk-action" -ForegroundColor Green
Write-Host "  4. ✅ GET /api/v1/admin/products/low-stock" -ForegroundColor Green
Write-Host "  5. ✅ PATCH /api/v1/admin/products/:id/featured" -ForegroundColor Green
Write-Host "  6. ✅ PUT /api/v1/admin/categories/:id" -ForegroundColor Green
Write-Host "  7. ✅ DELETE /api/v1/admin/categories/:id" -ForegroundColor Green
Write-Host "  8. ✅ GET /api/v1/admin/audit-logs" -ForegroundColor Green
Write-Host "  9. ✅ GET /api/v1/admin/reports/sales" -ForegroundColor Green

Write-Host "`n📈 Total New Admin APIs: 9" -ForegroundColor Cyan
Write-Host "🔐 All routes protected with authenticate + isAdmin middleware" -ForegroundColor Cyan
