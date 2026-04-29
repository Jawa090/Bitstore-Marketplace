# Admin Dashboard Fix Guide 🔧

## Current Issues

1. ✅ Admin dashboard page loads
2. ❌ API calls failing with 404/500 errors
3. ❌ Dashboard stats not loading
4. ❌ Cart API giving 500 error

---

## Root Cause

The admin user exists but:
- May not have proper roles assigned
- Database might be missing data
- APIs are failing due to missing records

---

## Solution: Run Seed Script

### Step 1: Stop Backend
```bash
# In backend terminal, press Ctrl+C
```

### Step 2: Run Seed Script
```bash
cd backend
npm run seed
```

This will:
- Create admin user with proper roles
- Create sample categories
- Create sample brands
- Create sample products
- Create sample collections

### Step 3: Restart Backend
```bash
npm run dev
```

### Step 4: Clear Browser & Re-login
1. Open browser console (F12)
2. Run this:
```javascript
localStorage.clear();
location.reload();
```
3. Login again with: `admin@bitstores.com` / `Admin123456`
4. Go to: `http://localhost:8080/admin`

---

## Alternative: Manual Database Check

If seed script doesn't work, check database manually:

### Check Admin User
```sql
-- Check if admin user exists
SELECT * FROM users WHERE email = 'admin@bitstores.com';

-- Check admin roles
SELECT ur.* 
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
WHERE u.email = 'admin@bitstores.com';
```

### Expected Result
```
user_id: <uuid>
role: admin
```

If role is missing, add it:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM users
WHERE email = 'admin@bitstores.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = users.id AND role = 'admin'
);
```

---

## Check API Endpoints

### Test Dashboard Stats API
```bash
# Get your token first (from browser localStorage)
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Response
```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "stats": {
      "totalUsers": 0,
      "totalProducts": 0,
      "totalOrders": 0,
      "totalRevenue": "0"
    }
  }
}
```

---

## Common Errors & Fixes

### Error: "Route not found"
**Cause**: React Router can't find the route  
**Fix**: This is just a warning, ignore it if dashboard loads

### Error: 404 on `/api/v1/admin/dashboard/stats`
**Cause**: Admin routes not properly registered  
**Fix**: Backend restart should fix this

### Error: 500 on `/api/cart`
**Cause**: User doesn't have a cart record  
**Fix**: Cart will be created automatically on first add

### Error: 500 on `/api/v1/admin/reports/sales`
**Cause**: No orders in database  
**Fix**: This is normal if no orders exist, API should return empty data

---

## Verify Everything Works

After seed script runs, check:

1. ✅ Login works
2. ✅ Admin dashboard loads
3. ✅ Stats show numbers (even if 0)
4. ✅ Sidebar navigation works
5. ✅ No 404 errors in console

---

## If Still Not Working

### Check Backend Logs
Look for errors in backend terminal:
- Database connection errors
- TypeORM errors
- Route registration errors

### Check Database Connection
```bash
# In backend directory
npm run typeorm migration:show
```

Should show all migrations as "executed"

### Re-run Migrations
```bash
npm run typeorm migration:run
```

---

## Quick Test Commands

### Test Admin Login
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bitstores.com",
    "password": "Admin123456"
  }'
```

### Test Admin Stats (with token)
```bash
TOKEN="your_token_here"
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Expected Final State

After all fixes:
- ✅ Admin dashboard loads without errors
- ✅ Stats cards show data (even if 0)
- ✅ Sidebar navigation works
- ✅ All admin pages accessible
- ✅ No console errors

---

## Next Steps

Once admin dashboard works:
1. Test user management page
2. Test product management page
3. Test category management page
4. Test audit logs page

All should work without errors! 🎉
