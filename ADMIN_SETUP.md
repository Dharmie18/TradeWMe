# Admin Features Setup Guide

## Overview
The PocketBroker admin dashboard provides comprehensive platform management capabilities including user management, transaction monitoring, analytics, and system alerts.

---

## 🔐 Admin Access Requirements

### 1. **Database Schema**
The admin system uses the `user` table with a `role` field:
- **Default role**: `"user"`
- **Admin role**: `"admin"`

Located in: `src/db/schema.ts` (Line 91)

### 2. **No Additional Environment Variables Needed**
✅ Admin features work with your existing environment variables:
- `TURSO_CONNECTION_URL` ✅ (You have this)
- `TURSO_AUTH_TOKEN` ✅ (You have this)
- `BETTER_AUTH_SECRET` ✅ (You have this)
- `BETTER_AUTH_URL` ✅ (You have this)
- `NEXT_PUBLIC_SITE_URL` ✅ (You have this)

---

## 🚀 How to Make a User an Admin

### Method 1: Direct Database Update (Recommended)

1. **Access your Turso database**:
   ```bash
   # Install Turso CLI if you haven't
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Login to Turso
   turso auth login
   
   # Connect to your database
   turso db shell <your-database-name>
   ```

2. **Update user role to admin**:
   ```sql
   -- Find the user you want to make admin
   SELECT id, name, email, role FROM user;
   
   -- Update their role to admin (replace 'user@example.com' with actual email)
   UPDATE user SET role = 'admin' WHERE email = 'user@example.com';
   
   -- Verify the change
   SELECT id, name, email, role FROM user WHERE email = 'user@example.com';
   ```

### Method 2: Create Admin User via API

Create a script to register and immediately promote a user:

```javascript
// create-admin.js
const fetch = require('node-fetch');

async function createAdmin() {
  const email = 'admin@pocketbroker.com';
  const password = 'your-secure-password';
  const name = 'Admin User';

  // 1. Register the user
  const registerResponse = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });

  console.log('User registered:', await registerResponse.json());

  // 2. Then manually update their role in the database using Method 1
  console.log('Now update the role in database using SQL command');
}

createAdmin();
```

---

## 📊 Admin Dashboard Features

### Access URL
```
http://localhost:3000/admin
```

### Features Available:

#### 1. **Analytics Overview**
- **Total Users**: All registered users
- **Active Users**: Users active in last 30 days
- **Total Volume**: Total transaction volume in USD
- **Transaction Stats**: Total, pending, failed, and completed transactions
- **Gas Metrics**: Average gas fees and total gas paid

#### 2. **Transaction Management**
- View all platform transactions
- Filter by status (pending, completed, failed)
- Search by transaction hash
- Export transaction data
- Real-time transaction monitoring

#### 3. **User Management**
- View all registered users
- Filter by role (user/admin)
- Search users by name or email
- View user details including:
  - Email and wallet address
  - Premium tier status
  - Transaction count
  - Total volume
  - Account creation date

#### 4. **Analytics Charts**
- Transaction volume trends
- User growth metrics
- Gas fee analysis
- Platform performance metrics

#### 5. **System Alerts**
- Failed transaction alerts
- High gas fee warnings
- Suspicious activity detection
- System health monitoring

---

## 🔒 Security Features

### Admin Route Protection
All admin routes are protected with role-based access control:

1. **Authentication Check**: User must be logged in
2. **Role Verification**: User role must be `"admin"`
3. **Token Validation**: Bearer token must be valid

### Protected API Endpoints:
```
/api/admin/analytics          - Platform analytics
/api/admin/users/list         - User listing
/api/admin/users-management   - User management
/api/admin/transactions/list  - Transaction listing
/api/admin/transactions-management - Transaction management
/api/admin/alerts             - System alerts
```

### Access Denied Behavior:
- Non-admin users: Redirected to home page with error message
- Unauthenticated users: Redirected to login page
- Invalid tokens: 403 Forbidden response

---

## 🎯 Admin UI Features

### Header Integration
The admin link appears in the header navigation only for admin users:
- Desktop: Shows in main navigation with Shield icon
- Mobile: Shows in hamburger menu
- Auto-detection: Checks admin status on component mount

### User Dropdown Menu
Admin users see an additional "Admin Dashboard" option in their profile dropdown.

---

## 🧪 Testing Admin Access

### 1. **Check if you're an admin**:
```javascript
// In browser console
const token = localStorage.getItem('bearer_token');
fetch('/api/admin/analytics', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);

// If you get data: You're an admin ✅
// If you get 403: You're not an admin ❌
```

### 2. **Verify role in database**:
```sql
SELECT id, name, email, role FROM user WHERE email = 'your@email.com';
```

---

## 📝 Common Admin Tasks

### View All Users
1. Navigate to `/admin`
2. Click "Users" tab
3. Use search and filters as needed

### Monitor Transactions
1. Navigate to `/admin`
2. Click "Transactions" tab
3. Filter by status or search by hash

### Check Platform Health
1. Navigate to `/admin`
2. View overview cards for quick stats
3. Click "Alerts" tab for warnings

### Export Data
1. Navigate to relevant tab (Users/Transactions)
2. Click "Export" button
3. Data downloads as CSV

---

## 🐛 Troubleshooting

### "Admin access required" error
**Cause**: User role is not set to "admin"
**Solution**: Update user role in database using Method 1 above

### Admin link not showing in header
**Cause**: Role check failing or session not refreshed
**Solution**: 
1. Log out and log back in
2. Clear browser cache
3. Verify role in database

### 403 Forbidden on admin routes
**Cause**: Invalid or expired token
**Solution**:
1. Log out and log back in
2. Check if `bearer_token` exists in localStorage
3. Verify `BETTER_AUTH_SECRET` is set correctly

---

## 🔄 First Admin User Setup (Step-by-Step)

1. **Register a new account** at `/register`
2. **Get your database connection**:
   ```bash
   turso db shell <your-db-name>
   ```
3. **Find your user ID**:
   ```sql
   SELECT id, email, role FROM user ORDER BY createdAt DESC LIMIT 5;
   ```
4. **Promote to admin**:
   ```sql
   UPDATE user SET role = 'admin' WHERE id = 'your-user-id';
   ```
5. **Verify**:
   ```sql
   SELECT id, email, role FROM user WHERE id = 'your-user-id';
   ```
6. **Log out and log back in** to refresh your session
7. **Navigate to** `/admin` - you should now have access!

---

## 📊 Database Queries for Admin Management

### List all admins:
```sql
SELECT id, name, email, role, createdAt FROM user WHERE role = 'admin';
```

### Count users by role:
```sql
SELECT role, COUNT(*) as count FROM user GROUP BY role;
```

### Demote admin to user:
```sql
UPDATE user SET role = 'user' WHERE email = 'user@example.com';
```

### Find users without role set:
```sql
SELECT id, email, role FROM user WHERE role IS NULL OR role = '';
```

---

## ✅ Summary

**Environment Variables Needed**: ✅ None (you already have all required ones)

**To Enable Admin Access**:
1. Register a user account
2. Update their role to 'admin' in the database
3. Log out and log back in
4. Access `/admin`

**Admin Features Include**:
- User management
- Transaction monitoring
- Platform analytics
- System alerts
- Data export capabilities

---

Need help? Check the API routes in `src/app/api/admin/` for implementation details.
