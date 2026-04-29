# 🚀 Admin API Quick Reference

**All routes require:** `Authorization: Bearer <admin_token>`

---

## 📊 Dashboard

```http
GET /api/v1/admin/dashboard/stats
```
Returns: Total users, products, brands, categories

---

## 👥 User Management

### List Users
```http
GET /api/v1/admin/users?page=1&limit=20&search=john
```

### User Details
```http
GET /api/v1/admin/users/:id
```

### User Statistics ✨ NEW
```http
GET /api/v1/admin/users/stats
```
Returns: Total, active, banned, new today, by role

### User Activity ✨ NEW
```http
GET /api/v1/admin/users/:id/activity
```
Returns: User info + recent actions

### Change Role
```http
PATCH /api/v1/admin/users/:id/role
Body: { "role": "admin" | "vendor" | "customer" }
```

### Toggle Status
```http
PATCH /api/v1/admin/users/:id/status
```
Toggles: active ↔ blocked

### Bulk Action ✨ NEW
```http
POST /api/v1/admin/users/bulk-action
Body: {
  "userIds": ["uuid1", "uuid2"],
  "action": "block" | "delete"
}
```

---

## 📦 Product Management

### List Products
```http
GET /api/v1/admin/products?page=1&limit=20&search=iphone&category_id=uuid&brand_id=uuid&is_active=true
```

### Delete Product
```http
DELETE /api/v1/admin/products/:id
```

### Toggle Featured ✨ NEW
```http
PATCH /api/v1/admin/products/:id/featured
```
Toggles: is_featured true ↔ false

### Low Stock Alert ✨ NEW
```http
GET /api/v1/admin/products/low-stock?threshold=10
```
Returns: Products with stock ≤ threshold

---

## 📂 Category Management

### Create Category
```http
POST /api/v1/admin/categories
Body: {
  "name": "Smartphones",
  "slug": "smartphones",
  "description": "Mobile phones",
  "icon_url": "https://...",
  "parent_id": "uuid",
  "display_order": 1
}
```

### Update Category ✨ NEW
```http
PUT /api/v1/admin/categories/:id
Body: {
  "name": "Premium Smartphones",
  "slug": "premium-smartphones",
  "description": "High-end phones",
  "is_active": true
}
```

### Delete Category ✨ NEW
```http
DELETE /api/v1/admin/categories/:id
```
⚠️ Fails if products linked or subcategories exist

---

## 📜 Audit & Reporting

### Audit Logs ✨ NEW
```http
GET /api/v1/admin/audit-logs?page=1&limit=50&action=DELETE_PRODUCT&entity_type=product&user_id=uuid
```
Returns: Admin action history

### Sales Report ✨ NEW
```http
GET /api/v1/admin/reports/sales?startDate=2026-04-01&endDate=2026-04-30
```
Returns: Revenue, orders, top products

---

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Body: {
  "email": "admin@bitstores.com",
  "password": "Admin123456"
}
```

---

## 📋 Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

---

## 🎯 Quick Test

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bitstores.com","password":"Admin123456"}'

# 2. Save token to token.txt

# 3. Test
./test-advanced-admin-apis.ps1
```

---

## ✨ New APIs (9)

1. GET `/api/v1/admin/users/stats`
2. GET `/api/v1/admin/users/:id/activity`
3. POST `/api/v1/admin/users/bulk-action`
4. PATCH `/api/v1/admin/products/:id/featured`
5. GET `/api/v1/admin/products/low-stock`
6. PUT `/api/v1/admin/categories/:id`
7. DELETE `/api/v1/admin/categories/:id`
8. GET `/api/v1/admin/audit-logs`
9. GET `/api/v1/admin/reports/sales`

---

**Total Admin APIs:** 17 (8 basic + 9 advanced)
