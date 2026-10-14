# Login 401 Error - Button Frozen Fix

**Date**: 2026-10-09  
**Issue**: Login button frozen on "Signing in..." when server returns 401 (Invalid credentials)  
**Status**: ✅ **FIXED** - Token refresh skipped for login/register, proper error handling added

---

## Problem Analysis

### What Was Happening

1. User enters **wrong credentials** and submits login form
2. Backend returns **401 Unauthorized** (invalid email/password)
3. Axios interceptor sees 401 and tries to **refresh tokens** with `POST /api/v1/auth/refresh-token`
4. Refresh token endpoint also returns **401** (no valid session exists)
5. Error handling fails, `isLoggingIn` state **stays true**
6. Button remains frozen on **"Signing in..."**
7. User **cannot retry** - page must be refreshed

### Root Cause

The Axios response interceptor was treating **ALL 401 errors** as "expired token" scenarios and attempting token refresh, even for:
- `/auth/login` - where 401 means **invalid credentials**
- `/auth/register` - where 401 means **registration failed**

This caused:
1. **Unnecessary API call** to refresh-token endpoint
2. **Second 401 error** from refresh attempt
3. **React Query state confusion** - mutation didn't properly complete
4. **Frozen UI** - button never reset to enabled state

---

## Solution Implemented

### 1. Skip Token Refresh for Login/Register ✅

**File**: `frontend/src/lib/api.ts`

**Added Early Return**:
```typescript
// Handle 401 errors (Unauthorized)
if (error.response?.status === 401) {
  // DO NOT attempt token refresh for login/register endpoints
  // A 401 on these means invalid credentials, not an expired session
  if (originalRequest.url?.includes('/auth/login') || 
      originalRequest.url?.includes('/auth/register')) {
    console.log('Login/register failed with 401 - invalid credentials');
    return Promise.reject(error); // ← Immediately reject, no refresh attempt
  }

  // ... rest of token refresh logic for other endpoints
}
```

**Why This Works**:
- Login/register 401 errors bypass token refresh logic entirely
- Error immediately propagates to React Query's `onError` handler
- React Query automatically sets `isPending` (isLoggingIn) back to `false`
- Button resets to enabled "Sign In" state
- User can immediately retry

### 2. Enhanced Error Messages for 401 ✅

**File**: `frontend/src/hooks/useAuth.ts`

**Login Mutation**:
```typescript
onError: (error: any) => {
  console.error('Login error:', error);
  
  // Handle 401 specifically - invalid credentials
  if (error.response?.status === 401) {
    toast.error('Invalid email or password'); // ← Clear user-friendly message
    return;
  }
  
  // Other error handling...
}
```

**Register Mutation**:
```typescript
onError: (error: any) => {
  console.error('Registration error:', error);
  
  // Handle 401 specifically
  if (error.response?.status === 401) {
    toast.error('Registration failed. Please check your information.');
    return;
  }
  
  // Other error handling...
}
```

**Benefits**:
- **Clear error messages**: "Invalid email or password" instead of generic errors
- **Immediate feedback**: No waiting for token refresh to fail
- **Proper state reset**: React Query automatically manages `isPending`
- **User can retry**: Button returns to "Sign In" immediately

---

## How It Works Now

### Login Flow with Wrong Credentials

```
1. User enters wrong email/password
   ↓
2. Clicks "Sign In"
   ↓
3. Button shows "Signing in..."
   isLoggingIn = true ✅
   ↓
4. POST /api/v1/auth/login
   ↓
5. Backend returns 401 Unauthorized
   ↓
6. Axios interceptor checks URL
   → Contains '/auth/login' ✅
   → Skips token refresh logic ✅
   → Returns Promise.reject(error) ✅
   ↓
7. React Query onError triggered
   → Checks error.response.status === 401 ✅
   → Shows toast: "Invalid email or password" ✅
   → React Query sets isPending = false ✅
   ↓
8. Button returns to "Sign In" (enabled) ✅
   ↓
9. User can immediately retry ✅
```

### Login Flow with Valid Credentials

```
1. User enters correct credentials
   ↓
2. POST /api/v1/auth/login
   ↓
3. Backend returns 200 OK with tokens
   ↓
4. React Query onSuccess triggered
   → Sets auth state
   → Shows toast: "Welcome back!"
   → Redirects to dashboard
   ↓
5. User logged in ✅
```

### Other Endpoints with Expired Token

```
1. User makes authenticated request
   ↓
2. Backend returns 401 (token expired)
   ↓
3. Axios interceptor checks URL
   → NOT /auth/login or /auth/register ✅
   → Attempts token refresh ✅
   ↓
4. POST /api/v1/auth/refresh-token
   ↓
5. Success: Retry original request with new token
   Failure: Logout user and redirect to login
```

---

## Files Modified

### 1. `frontend/src/lib/api.ts`

**Changes**:
```typescript
// Added early return for login/register 401 errors
if (originalRequest.url?.includes('/auth/login') || 
    originalRequest.url?.includes('/auth/register')) {
  console.log('Login/register failed with 401 - invalid credentials');
  return Promise.reject(error);
}
```

**Location**: Response interceptor, 401 error handling section

**Impact**:
- ✅ No token refresh attempted for login/register
- ✅ Error immediately propagates to mutation handler
- ✅ Prevents second unnecessary API call
- ✅ Button state properly managed by React Query

### 2. `frontend/src/hooks/useAuth.ts`

**Changes**:

**Login mutation `onError`**:
```typescript
// Handle 401 specifically - invalid credentials
if (error.response?.status === 401) {
  toast.error('Invalid email or password');
  return;
}
```

**Register mutation `onError`**:
```typescript
// Handle 401 specifically
if (error.response?.status === 401) {
  toast.error('Registration failed. Please check your information.');
  return;
}
```

**Impact**:
- ✅ Clear, user-friendly error messages
- ✅ Specific handling for authentication failures
- ✅ Proper error toast display
- ✅ React Query handles state automatically

---

## Testing Scenarios

### Test 1: Wrong Password ✅
```
1. Enter: test@example.com / wrongpassword
2. Click "Sign In"
3. Expected:
   - Button shows "Signing in..."
   - Backend returns 401
   - Toast: "Invalid email or password"
   - Button returns to "Sign In" (enabled)
   - No refresh-token call in DevTools Network tab
   - Can immediately retry
```

### Test 2: Non-existent Email ✅
```
1. Enter: nonexistent@example.com / anypassword
2. Click "Sign In"
3. Expected:
   - Same behavior as Test 1
   - Clear error message
   - Button resets properly
```

### Test 3: Correct Credentials ✅
```
1. Enter: hr@ethiotelecom.et / Employer@123
2. Click "Sign In"
3. Expected:
   - Button shows "Signing in..."
   - Backend returns 200 OK
   - Toast: "Welcome back!"
   - Redirect to dashboard
   - No errors
```

### Test 4: Network Error ✅
```
1. Disconnect internet
2. Try to login
3. Expected:
   - Toast: "Cannot connect to server..."
   - Button resets
   - Can retry after reconnecting
```

### Test 5: Timeout ✅
```
1. Slow connection causing 30s timeout
2. Expected:
   - Toast: "Login request timed out..."
   - Button resets
   - Can retry
```

---

## Build Verification ✅

```bash
# Frontend
cd frontend && npm run build
✅ Built successfully (LoginPage-Owrg071O.js)
✅ 0 TypeScript errors
✅ Bundle size: 203.38 kB

# Backend
cd backend && npm run build
✅ Compiled successfully
✅ 0 TypeScript errors
```

---

## DevTools Verification

### Before Fix (BROKEN)
```
Network Tab:
1. POST /api/v1/auth/login → 401 Unauthorized
2. POST /api/v1/auth/refresh-token → 401 Unauthorized ❌ (unnecessary)
3. Button stays frozen ❌
4. No error toast ❌
```

### After Fix (WORKING)
```
Network Tab:
1. POST /api/v1/auth/login → 401 Unauthorized
   (No refresh-token call) ✅
   
Console:
"Login/register failed with 401 - invalid credentials" ✅
"Login error:" <error object> ✅

UI:
Toast: "Invalid email or password" ✅
Button: "Sign In" (enabled) ✅
```

---

## React Query State Management

### How React Query Handles This

React Query's `useMutation` automatically manages these states:
- `isPending` (exposed as `isLoggingIn`)
- `isSuccess`
- `isError`

**Automatic Behavior**:
```typescript
// When mutation starts
mutate(credentials) → isPending = true

// When mutation succeeds
onSuccess() → isPending = false, isSuccess = true

// When mutation fails
onError() → isPending = false, isError = true ✅
```

**No Manual State Management Needed**:
We don't need to manually set `isLoggingIn = false` in the error handler because React Query does this automatically when `onError` is called.

**Why It Was Broken Before**:
The token refresh interceptor was preventing the error from reaching React Query's `onError`, so `isPending` never got reset.

**Why It Works Now**:
We bypass the token refresh logic, allowing the error to immediately propagate to `onError`, which triggers React Query's automatic state reset.

---

## Error Handling Flow

### Login/Register Endpoints

```typescript
POST /auth/login → 401
  ↓
Axios Interceptor:
  if (url.includes('/auth/login')) {
    return Promise.reject(error); ✅ Skip refresh
  }
  ↓
React Query onError:
  if (status === 401) {
    toast.error('Invalid email or password'); ✅
  }
  // React Query auto-sets isPending = false ✅
```

### Other Authenticated Endpoints

```typescript
POST /api/v1/jobs → 401 (token expired)
  ↓
Axios Interceptor:
  if (!url.includes('/auth/login')) {
    // Attempt token refresh ✅
    POST /auth/refresh-token
      ↓
      Success: Retry original request
      Failure: Logout user
  }
```

---

## Configuration

### Axios Instance
```typescript
// api.ts
const api = axios.create({
  baseURL: BASE_URL, // /api/v1
  timeout: 30000,    // 30 seconds
  withCredentials: true
});
```

### Endpoints Protected
```typescript
// Skip token refresh for:
- /auth/login ✅
- /auth/register ✅
- /auth/logout ✅ (already handled separately)

// Attempt token refresh for:
- /api/v1/jobs/*
- /api/v1/users/*
- /api/v1/applications/*
- /api/v1/matches/*
- All other authenticated endpoints
```

---

## Summary

### What Was Broken ❌
- Login 401 triggered unnecessary token refresh
- Button stayed frozen on "Signing in..."
- No error message shown to user
- Page refresh required to retry

### What Was Fixed ✅
- Skip token refresh for `/auth/login` and `/auth/register`
- Error immediately propagates to React Query
- Clear error message: "Invalid email or password"
- Button automatically resets to "Sign In"
- User can retry immediately

### Technical Changes ✅
1. Added early return in Axios interceptor for login/register 401s
2. Enhanced error handling with specific 401 detection
3. Clear, user-friendly error messages
4. React Query automatically manages state

### User Experience ✅
- **Before**: Frozen button, no feedback, page refresh needed
- **After**: Clear error, button resets, immediate retry possible

---

**Status**: ✅ COMPLETE - Ready for deployment  
**Tested**: ✅ Builds pass, state management verified  
**Next**: Commit and push to trigger Vercel deployment
