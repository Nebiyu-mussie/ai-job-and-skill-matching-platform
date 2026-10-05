# 🔍 Logout Debug Guide

## Updated Logout Implementation

I've completely rewritten the logout function to be more direct and include debug logging.

### What Changed

**Before** (using React Query mutation):
```typescript
const logoutMutation = useMutation({...});
const handleLogout = () => logoutMutation.mutate();
```

**After** (direct async function):
```typescript
const handleLogout = async () => {
  console.log('🔴 Logout clicked');
  
  try {
    await api.post('/auth/logout');
    console.log('✅ Backend logout successful');
  } catch (error) {
    console.warn('⚠️ Backend logout failed:', error);
  }
  
  console.log('🧹 Cleaning up local state...');
  storeLogout();
  disconnectSocket();
  queryClient.clear();
  
  console.log('🎉 Logout complete, showing toast and redirecting');
  toast.success('Logged out successfully');
  navigate('/login', { replace: true });
};
```

## How to Test

### Step 1: Hard Refresh the Browser
Since HMR might not always update hooks properly:
1. Open http://localhost:5173
2. Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
3. This forces a complete page reload

### Step 2: Open Browser Console
1. Right-click → Inspect → Console tab
2. Keep this open during testing

### Step 3: Login
1. Login with: `john.doe@gmail.com` / `JobSeeker@123`
2. You should see the dashboard

### Step 4: Click Sign Out
1. Click the "Sign Out" button (red button at bottom of sidebar)
2. Watch the console for these logs:

**Expected Console Output:**
```
🔴 Logout clicked
✅ Backend logout successful (or ⚠️ Backend logout failed)
🧹 Cleaning up local state...
🔌 Socket disconnected
🎉 Logout complete, showing toast and redirecting
```

**Expected Browser Behavior:**
- ✅ See green toast: "Logged out successfully"
- ✅ Redirected to /login page
- ✅ URL changes to http://localhost:5173/login
- ✅ Cannot navigate back to /dashboard (should redirect to /login)

### Step 5: Verify Logout State
Check localStorage:
1. In Console, type: `localStorage.getItem('auth-storage')`
2. Should show: `{"state":{"user":null,"accessToken":null,"isAuthenticated":false},"version":0}`

## Troubleshooting

### Issue 1: Nothing happens when clicking "Sign Out"

**Diagnosis:**
```javascript
// In browser console, check if the logout function exists
useAuthStore.getState()
```

**Solution:**
1. Hard refresh the page (Cmd+Shift+R)
2. Clear browser cache
3. Check console for errors

### Issue 2: No console logs appear

**Diagnosis:**
The logout function might not be getting called.

**Solution:**
1. Check if the button's onClick is working:
```javascript
// Add this temporarily to DashboardSidebar.tsx
onClick={() => {
  console.log('Button clicked!');
  logout();
}}
```

### Issue 3: Logs appear but no redirect

**Diagnosis:**
Navigation might be blocked by something.

**Solution:**
Try the emergency logout:
```javascript
// In browser console:
const { logout } = useAuthStore.getState();
logout();
window.location.href = '/login';
```

### Issue 4: Toast doesn't show

**Diagnosis:**
Toast system might not be initialized.

**Solution:**
Check if `<Toaster />` is in App.tsx (it is).

### Issue 5: Redirect happens but can still access /dashboard

**Diagnosis:**
AuthGuard might not be checking auth state properly.

**Solution:**
1. Check localStorage (should be cleared)
2. Try accessing /dashboard directly
3. Should redirect to /login

## Manual Test Commands

### Test 1: Check Auth State
```javascript
// In browser console
useAuthStore.getState().isAuthenticated  // Should be true before logout, false after
```

### Test 2: Manually Trigger Logout
```javascript
// In browser console
const store = useAuthStore.getState();
store.logout();
console.log('Manual logout:', store.isAuthenticated); // Should be false
```

### Test 3: Force Redirect
```javascript
// In browser console
window.location.href = '/login';
```

### Test 4: Clear Everything
```javascript
// Nuclear option - clear everything
localStorage.clear();
sessionStorage.clear();
window.location.href = '/login';
```

## File Locations

The logout functionality is in these files:

1. **useAuth Hook**: `frontend/src/hooks/useAuth.ts`
   - Contains the `handleLogout()` function

2. **Auth Store**: `frontend/src/store/authStore.ts`
   - Contains the `logout()` state function

3. **Logout Buttons**:
   - `frontend/src/components/navigation/DashboardSidebar.tsx` (Line ~160)
   - `frontend/src/components/navigation/Navbar.tsx` (Line ~100)
   - `frontend/src/components/navigation/AdminSidebar.tsx` (Line ~70)

4. **Auth Guard**: `frontend/src/components/guards/AuthGuard.tsx`
   - Protects routes and redirects if not authenticated

## Expected Behavior Flow

```
1. User clicks "Sign Out" button
   ↓
2. onClick handler calls logout()
   ↓
3. handleLogout() function executes
   ↓
4. Console log: "🔴 Logout clicked"
   ↓
5. Try to call backend API: POST /api/v1/auth/logout
   ↓
6. Console log: "✅ Backend logout successful" or "⚠️ Backend logout failed"
   ↓
7. Call storeLogout() → Sets isAuthenticated = false
   ↓
8. Call disconnectSocket() → Closes WebSocket
   ↓
9. Call queryClient.clear() → Removes cached data
   ↓
10. Console log: "🎉 Logout complete, showing toast and redirecting"
    ↓
11. toast.success() → Shows green notification
    ↓
12. navigate('/login', { replace: true }) → Redirects
    ↓
13. AuthGuard detects isAuthenticated = false
    ↓
14. User is at /login page
    ↓
15. Trying to access /dashboard redirects back to /login
```

## What to Report

If logout still doesn't work, please provide:

1. **Console logs**: Copy all console output when clicking "Sign Out"
2. **Network tab**: Check if POST /api/v1/auth/logout is called
3. **localStorage**: Value of `localStorage.getItem('auth-storage')` before and after
4. **Current URL**: What URL are you on before/after logout?
5. **Any errors**: Red error messages in console

## Quick Fixes to Try

### Fix 1: Hard Refresh
```
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Fix 2: Clear Cache
```
1. Open DevTools
2. Right-click Refresh button
3. Choose "Empty Cache and Hard Reload"
```

### Fix 3: Emergency Logout (Browser Console)
```javascript
localStorage.clear();
window.location.href = '/login';
```

### Fix 4: Restart Frontend Dev Server
```bash
# In terminal
cd frontend
# Press Ctrl+C to stop
npm run dev
```

## Next Steps

After you test with the debug logs:
1. Open browser at http://localhost:5173
2. Hard refresh (Cmd+Shift+R)
3. Login
4. Open Console
5. Click "Sign Out"
6. **Tell me exactly what console logs you see**
7. **Tell me what happens on the screen**

This will help me identify the exact issue!
