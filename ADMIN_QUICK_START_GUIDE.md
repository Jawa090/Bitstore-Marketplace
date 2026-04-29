# 🚀 Admin Panel Quick Start Guide

## 📋 Prerequisites

- Backend server running on `http://localhost:3000`
- Frontend server running on `http://localhost:5173`
- Admin user created in database

---

## 🔐 Admin Credentials

```
Email: admin@bitstores.com
Password: Admin123456
```

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Login & Access
1. Open browser: `http://localhost:5173`
2. Click "Login" button
3. Enter admin credentials
4. Navigate to: `http://localhost:5173/admin`

---

## 📱 Admin Panel Features

### 1. Dashboard (`/admin`)
- View total users, products, brands, categories
- See sales summary (orders, revenue, VAT)
- Check top 5 products by revenue

### 2. User Management (`/admin/users`)
**Search & Filter:**
- Search by email or name
- View all users with pagination (20 per page)

**Individual Actions:**
- Change user role (Customer/Vendor/Admin)
- Block/Unblock user
- View user details

**Bulk Actions:**
- Select multiple users with checkboxes
- Bulk block users
- Bulk delete users

### 3. Product Management (`/admin/products`)
**Search & Filter:**
- Search by product name
- Filter by status (Active/Inactive)
- Filter by condition (New, Used, Refurbished)

**Actions:**
- Toggle featured status (star icon)
- Delete product
- View low stock alert

### 4. Category Management (`/admin/categories`)
- View all categories in grid layout
- Delete categories (with safety checks)
- Create new categories (coming soon)

### 5. Audit Logs (`/admin/audit-logs`)
**View Activity:**
- See all admin actions
- Filter by action type
- Filter by entity type
- View user who performed action
- See timestamp and details

---

## 🎨 UI Features

### Pagination
- Navigate between pages
- See current page and total pages
- View total item count

### Search
- Debounced search (500ms delay)
- Real-time filtering
- Automatic page reset

### Bulk Selection
- Select all checkbox
- Individual selection
- Selected count display
- Bulk action buttons

### Dark Mode
- Automatic dark mode support
- Consistent across all pages

---

## ⚠️ Important Notes

### Safety Features
1. **Admin cannot modify themselves:**
   - Cannot change own role
   - Cannot block themselves
   - Cannot include themselves in bulk actions

2. **Confirmation dialogs:**
   - All destructive actions require confirmation
   - Clear warning messages

3. **Category deletion:**
   - Fails if products are linked
   - Fails if subcategories exist

### Performance
- Pagination prevents loading 1000+ records
- Debounced search reduces API calls
- Efficient data fetching

---

## 🔍 Testing the Features

### Test User Management
```bash
1. Go to /admin/users
2. Search for "john"
3. Select 2 users
4. Click "Block (2)"
5. Confirm action
6. Verify users are blocked
```

### Test Product Featured Toggle
```bash
1. Go to /admin/products
2. Find any product
3. Click star icon
4. Verify star turns yellow
5. Check product on homepage
```

### Test Audit Logs
```bash
1. Perform any admin action (e.g., block user)
2. Go to /admin/audit-logs
3. See the action logged
4. Filter by action type
5. View details
```

---

## 🐛 Troubleshooting

### Issue: Cannot access /admin
**Solution:** Make sure you're logged in as admin user

### Issue: "Failed to load data"
**Solution:** Check if backend server is running on port 3000

### Issue: Search not working
**Solution:** Wait 500ms after typing (debounced)

### Issue: Pagination not showing
**Solution:** Make sure you have more than 20 items

---

## 📊 API Endpoints Used

```
Dashboard:
- GET /api/v1/admin/dashboard/stats
- GET /api/v1/admin/reports/sales

Users:
- GET /api/v1/admin/users
- PATCH /api/v1/admin/users/:id/role
- PATCH /api/v1/admin/users/:id/status
- POST /api/v1/admin/users/bulk-action

Products:
- GET /api/v1/admin/products
- PATCH /api/v1/admin/products/:id/featured
- DELETE /api/v1/admin/products/:id

Categories:
- GET /api/v1/categories
- DELETE /api/v1/admin/categories/:id

Audit Logs:
- GET /api/v1/admin/audit-logs
```

---

## 🎯 Common Tasks

### How to Block a User
1. Go to `/admin/users`
2. Find the user
3. Click the red "X" icon
4. Confirm action

### How to Feature a Product
1. Go to `/admin/products`
2. Find the product
3. Click the star icon
4. Product is now featured

### How to Delete Multiple Users
1. Go to `/admin/users`
2. Check boxes next to users
3. Click "Delete (X)"
4. Confirm action

### How to View Audit Trail
1. Go to `/admin/audit-logs`
2. Use filters if needed
3. View all admin actions

---

## 📱 Keyboard Shortcuts (Coming Soon)

```
Ctrl + K     → Search
Ctrl + B     → Toggle sidebar
Ctrl + D     → Go to dashboard
Ctrl + U     → Go to users
Ctrl + P     → Go to products
```

---

## 🔄 What's Next

### Phase 2 Features
- User details modal with activity history
- Low stock dashboard page
- Category create/edit forms
- Product bulk actions
- Export to CSV
- Advanced filters

### Phase 3 Features
- Real-time updates
- Analytics charts
- Notification system
- Mobile app
- Keyboard shortcuts

---

## 📞 Support

### Admin Credentials
```
Email: admin@bitstores.com
Password: Admin123456
```

### Database Connection
```
Host: localhost
Port: 5432
Database: bitstores
User: postgres
Password: admin123
```

### API Base URL
```
http://localhost:3000
```

---

## ✅ Quick Checklist

Before using the admin panel:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Logged in as admin
- [ ] Database has sample data
- [ ] Admin user exists

---

**Happy Administrating! 🎉**
