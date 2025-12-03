# 🚀 Quick Admin Setup Guide

Since the Turso CLI installation is having network issues, here's the **easiest way** to make yourself an admin:

---

## ✅ **Method 1: Turso Web Dashboard** (RECOMMENDED - No CLI needed!)

### Step 1: Access Turso Dashboard
1. Go to **https://turso.tech**
2. **Login** with your Turso account
3. Select your database from the dashboard

### Step 2: Open SQL Console
1. Click on your database name
2. Look for **"SQL Console"** or **"Query"** tab
3. You should see a text area where you can run SQL commands

### Step 3: Find Your User Email
First, let's see what users exist:
```sql
SELECT id, name, email, role FROM user ORDER BY createdAt DESC;
```

### Step 4: Promote User to Admin
Replace `your@email.com` with your actual email from the results above:
```sql
UPDATE user SET role = 'admin' WHERE email = 'your@email.com';
```

### Step 5: Verify the Change
```sql
SELECT id, name, email, role FROM user WHERE email = 'your@email.com';
```

You should see `role = 'admin'` in the results!

### Step 6: Access Admin Dashboard
1. **Log out** of your PocketBroker account
2. **Log back in** (this refreshes your session)
3. Navigate to **http://localhost:3000/admin**
4. 🎉 You should now see the admin dashboard!

---

## 🔧 **Method 2: Using Node.js Script** (If network issues resolve)

I've created helper scripts for you:

### List all users:
```bash
node setup-admin.js
```

### Promote a specific user:
```bash
node promote-admin.js "user@email.com"
```

---

## 📝 **Method 3: Direct SQL Query** (If you have database access tool)

If you have any SQLite database tool installed (like DB Browser for SQLite), you can:

1. Download your database from Turso
2. Open it in your SQLite tool
3. Run this query:
```sql
UPDATE user SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 🎯 **Quick Checklist**

- [ ] Access Turso web dashboard at https://turso.tech
- [ ] Open SQL console for your database
- [ ] Run: `SELECT * FROM user;` to see your users
- [ ] Run: `UPDATE user SET role = 'admin' WHERE email = 'your@email.com';`
- [ ] Verify: `SELECT email, role FROM user WHERE role = 'admin';`
- [ ] Log out and log back in to PocketBroker
- [ ] Visit http://localhost:3000/admin
- [ ] ✅ Done!

---

## 🐛 **Troubleshooting**

### "No users found"
- Register a user first at: http://localhost:3000/register
- Then run the SQL query again

### "Admin access required" after update
- Make sure you logged out and logged back in
- Clear browser cache/cookies
- Check that the role was actually updated in the database

### Can't access Turso dashboard
- Make sure you're logged into the same account that created the database
- Check your TURSO_CONNECTION_URL in .env to see which database you're using

---

## 💡 **What's Next?**

Once you're an admin, you'll have access to:

✅ **User Management** - View and manage all users  
✅ **Transaction Monitoring** - Track all platform transactions  
✅ **Analytics Dashboard** - Platform statistics and metrics  
✅ **System Alerts** - Monitor platform health  
✅ **Data Export** - Export users and transactions  

---

## 📞 **Need Help?**

If you're having trouble:
1. Check that your `.env` file has the correct `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN`
2. Make sure you have at least one registered user
3. Try the Turso web dashboard method - it's the most reliable!

---

**Recommended**: Use the **Turso Web Dashboard** method - it's the fastest and doesn't require any CLI installation!
