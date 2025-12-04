# Dashboard Not Opening - Troubleshooting Guide

## Problem
Dashboard page not loading after login, or redirecting back to login page.

---

## Quick Fixes

### Fix 1: Check Browser Console
1. Open browser (Chrome/Edge/Firefox)
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Try logging in again
5. Look for these messages:
   - ✅ "Session found: {user data}" - Good!
   - ❌ "No session found, redirecting to login" - Problem!

### Fix 2: Check localStorage
1. In Developer Tools, go to "Application" tab
2. Click "Local Storage" → Your domain
3. Look for `bearer_token`
4. If missing or empty → Re-login
5. If present → Check if it's valid

### Fix 3: Clear Cache and Re-login
```bash
# In browser console:
localStorage.clear();
# Then refresh page and login again
```

---

## Root Causes & Solutions

### Cause 1: Session Not Persisting
**Symptoms:**
- Logs in successfully
- Redirects to dashboard
- Immediately redirects back to login

**Solution:**
Check `src/lib/auth-client.ts`:
```typescript
// Verify bearer_token is being saved
localStorage.setItem("bearer_token", tokenPart);
```

**Test:**
1. Login
2. Check console for "set-auth-token" header
3. Verify token saved in localStorage
4. Refresh page - should stay logged in

---

### Cause 2: Better Auth Configuration
**Symptoms:**
- Login works
- Session API returns null
- Dashboard shows loading forever

**Solution:**
Check `.env` file:
```bash
BETTER_AUTH_SECRET=your_secret_here
```

**Verify:**
```bash
# Test session endpoint
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Cause 3: API Route Issues
**Symptoms:**
- Dashboard loads
- But shows "Welcome back, undefined!"
- Or shows loading spinner forever

**Solution:**
Check `/api/auth/session` endpoint:
1. Open Network tab in DevTools
2. Look for `/api/auth/session` request
3. Check response status (should be 200)
4. Check response body (should have user data)

**If 401 Unauthorized:**
- Token is invalid or expired
- Re-login required

**If 500 Server Error:**
- Check Vercel logs
- Check database connection
- Check better-auth configuration

---

## Step-by-Step Debug Process

### Step 1: Enable Debug Mode
Add to `src/app/dashboard/page.tsx`:
```typescript
useEffect(() => {
  console.log('Dashboard mounted');
  console.log('Session:', session);
  console.log('isPending:', isPending);
  console.log('User:', session?.user);
}, [session, isPending]);
```

### Step 2: Test Login Flow
1. Go to `/login`
2. Open console
3. Enter credentials
4. Click login
5. Watch console messages:
   ```
   ✅ Login successful
   ✅ Token received
   ✅ Token saved to localStorage
   ✅ Redirecting to dashboard
   ✅ Dashboard mounted
   ✅ Session: {user: {...}}
   ```

### Step 3: Test Session Persistence
1. Login successfully
2. Refresh page (F5)
3. Should stay on dashboard
4. Should NOT redirect to login

**If redirects:**
- Session not persisting
- Check localStorage
- Check token expiration

### Step 4: Test API Endpoints
```bash
# Get your token from localStorage
# Then test:

# Test session
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return:
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "Cannot read property 'user' of null"
**Cause:** Session is null
**Solution:**
```typescript
// Add null check
if (!session?.user) {
  return <div>Loading...</div>;
}
```

### Issue 2: Infinite redirect loop
**Cause:** useEffect keeps triggering
**Solution:**
```typescript
// Add dependency array
useEffect(() => {
  // ...
}, [session, isPending, router]); // ← Important!
```

### Issue 3: Dashboard loads but no data
**Cause:** User data not fetched
**Solution:**
```typescript
// Fetch user data
useEffect(() => {
  if (session?.user?.id) {
    fetchUserData(session.user.id);
  }
}, [session]);
```

---

## Testing Checklist

- [ ] Login works
- [ ] Token saved to localStorage
- [ ] Dashboard loads after login
- [ ] User name displays correctly
- [ ] Refresh page stays on dashboard
- [ ] Logout works
- [ ] Re-login works
- [ ] No console errors

---

## Quick Test Script

Run this in browser console after login:
```javascript
// Check session
console.log('Token:', localStorage.getItem('bearer_token'));

// Test session API
fetch('/api/auth/session', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Session data:', data));

// Check current page
console.log('Current path:', window.location.pathname);
```

**Expected Output:**
```
Token: abc123...
Session data: { user: { id: "...", name: "...", email: "..." } }
Current path: /dashboard
```

---

## If Still Not Working

### Option 1: Bypass Auth Temporarily
For testing only:
```typescript
// In dashboard/page.tsx
export default function DashboardPage() {
  // Comment out auth check temporarily
  // useEffect(() => {
  //   if (!isPending && !session?.user) {
  //     router.push('/login?redirect=/dashboard');
  //   }
  // }, [session, isPending, router]);

  return (
    <div>
      <h1>Dashboard (Test Mode)</h1>
      {/* Your dashboard content */}
    </div>
  );
}
```

### Option 2: Use Mock Session
```typescript
const mockSession = {
  user: {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com'
  }
};

// Use mockSession instead of session
```

### Option 3: Check Better Auth Setup
```bash
# Verify better-auth is installed
npm list better-auth

# Reinstall if needed
npm install better-auth@latest

# Check configuration
cat src/lib/auth.ts
```

---

## Production Deployment

Before deploying:
1. ✅ Test login locally
2. ✅ Test dashboard locally
3. ✅ Test session persistence
4. ✅ Remove debug console.logs
5. ✅ Set proper BETTER_AUTH_SECRET in Vercel
6. ✅ Test on production after deploy

---

## Support

If issue persists:
1. Check Vercel logs
2. Check browser console
3. Check network tab
4. Test API endpoints directly
5. Verify environment variables

---

**Last Updated:** December 4, 2024
**Status:** Troubleshooting guide
**Next:** Test and fix based on console output
