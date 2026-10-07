# 🔍 Production Diagnostic & Recovery Guide

## Problem: App Was Working Yesterday, Now Completely Failing

This guide helps diagnose infrastructure, database, and memory issues when **no code changed**.

---

## ✅ What We Fixed

### 1. **Enhanced MongoDB Connection Logging** ✅
**File:** `backend/src/config/database.ts`

**Added:**
- ✅ Detailed connection attempt logging with masked credentials
- ✅ Multiple mongoose event listeners (connected, error, disconnected, reconnected, reconnectFailed)
- ✅ Specific error diagnostics for common issues:
  - Authentication failures (`bad auth`)
  - Connection timeouts (IP whitelist issues)
  - DNS resolution failures
  - Connection refused errors
- ✅ Increased `serverSelectionTimeoutMS` from 5s to 10s for Render cold starts
- ✅ Helper function `checkDatabaseHealth()` for status checks

**What You'll See in Logs:**
```
🔌 Attempting MongoDB connection to: mongodb://user:****@...
✅ Mongoose successfully connected to MongoDB
📊 Database Name: job_matching_db
📡 Connection State: connected
```

**If Connection Fails, You'll See:**
```
❌ CRITICAL: Failed to connect to MongoDB on initial attempt
📝 Error Message: [specific error]

🔐 DIAGNOSIS: Authentication Failed
   - Check MONGODB_URI username and password
   - Verify MongoDB Atlas user has correct permissions
   - Ensure special characters in password are URL-encoded

⏱️  DIAGNOSIS: Connection Timeout
   - MongoDB Atlas may be blocking this IP address
   - Add 0.0.0.0/0 to Network Access in MongoDB Atlas
```

---

### 2. **Enhanced Health Check Endpoint** ✅
**File:** `backend/src/app.ts`
**Endpoint:** `GET /health`

**Before:**
```json
{
  "success": true,
  "message": "API is running"
}
```

**Now:**
```json
{
  "success": true,
  "message": "AI Job Platform API is running",
  "timestamp": "2026-09-26T15:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "database": {
    "connected": true,
    "state": "connected",
    "name": "job_matching_db",
    "readyState": 1
  },
  "memory": {
    "used": "85MB",
    "total": "120MB",
    "rss": "150MB"
  },
  "uptime": "3600s"
}
```

**Database States:**
- `0` = disconnected
- `1` = connected ✅
- `2` = connecting
- `3` = disconnecting

**If Database Disconnected:**
```json
{
  "success": false,
  "message": "API is running but database is not connected",
  "database": {
    "connected": false,
    "state": "disconnected",
    "readyState": 0
  }
}
```
- Returns `503 Service Unavailable` instead of `200 OK`

---

### 3. **Enhanced Server Startup Logging** ✅
**File:** `backend/src/server.ts`

**What You'll See:**
```
🚀 Starting server initialization...
📝 Environment: production
📍 Port: 5001
🌐 Frontend URL: https://your-app.vercel.app
🤖 AI Service URL: http://localhost:8000

📊 Step 1: Connecting to MongoDB...
🔌 Attempting MongoDB connection to: mongodb://user:****@...
✅ Mongoose successfully connected to MongoDB
✅ MongoDB connection established

📊 Step 2: Seeding admin user (if not exists)...
✅ Admin seed check complete

📊 Step 3: Starting HTTP server...

🎉 ===================================
🚀 Server running on port 5001
📖 Environment: production
📖 API Docs: http://localhost:5001/api/v1/docs
🏥 Health Check: http://localhost:5001/health
🎉 ===================================
```

**If Startup Fails:**
```
❌ =========================================
❌ CRITICAL: Failed to start server
❌ =========================================
Error details: [full error object]

📝 Error Message: [specific message]

📚 Stack Trace:
[stack trace]

🔍 TROUBLESHOOTING STEPS:
1. Check that all environment variables are set in Render dashboard
2. Verify MONGODB_URI is correct and MongoDB Atlas is accessible
3. Check Network Access in MongoDB Atlas (add 0.0.0.0/0 to allow all IPs)
4. Verify MongoDB Atlas cluster is not paused
5. Check Render logs for more details: https://dashboard.render.com
❌ =========================================
```

---

### 4. **Enhanced Unhandled Error Logging** ✅
**File:** `backend/src/server.ts`

**Unhandled Promise Rejections:**
```
❌ ==========================================
❌ UNHANDLED PROMISE REJECTION DETECTED!
❌ ==========================================
Reason: [error reason]
Promise: [promise details]
Message: [error message]
Stack:
[full stack trace]

🔄 Attempting graceful shutdown...
Server closed. Exiting process.
```

**Uncaught Exceptions:**
```
❌ ==========================================
❌ UNCAUGHT EXCEPTION DETECTED!
❌ ==========================================
Error: [error object]
Message: [error message]
Stack:
[full stack trace]

⚠️  Immediate shutdown required for uncaught exception
```

---

### 5. **Enhanced CORS Logging** ✅
**File:** `backend/src/app.ts`

**On Startup:**
```
🔐 CORS Configuration:
   - Frontend URL: https://your-app.vercel.app
   - Vercel domains: *.vercel.app (allowed)
   - Credentials: enabled
```

**When CORS Blocks Request:**
```
⚠️  CORS: Blocked request from unauthorized origin: https://suspicious-site.com
✅ Allowed origins: https://your-app.vercel.app, http://localhost:5173
✅ Also allowed: *.vercel.app domains
```

---

### 6. **Enhanced Error Handler Logging** ✅
**File:** `backend/src/middleware/errorHandler.ts`

**For Every Error:**
```
❌ ==========================================
❌ ERROR: POST /api/v1/auth/login
❌ ==========================================
Message: Invalid credentials
Status: 401
Request Body: {
  "email": "test@email.com",
  "password": "****"
}
Stack Trace:
[stack trace]
❌ ==========================================
```

**Specific Error Types Logged:**
- 🔑 MongoDB Duplicate Key Errors
- ✏️  Mongoose Validation Errors
- 🆔 Invalid ObjectId Errors
- 🔐 JWT Token Errors
- ⏱️  JWT Expiration Errors
- 📁 File Upload Errors
- 🔌 MongoDB Connection Errors

---

## 🔍 Where to Look in Render Logs

### Step 1: Access Render Logs
1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click **"Logs"** tab
4. Set to **"Live"** mode

### Step 2: Look for Critical Sections

#### ✅ Successful Startup Pattern:
```
🚀 Starting server initialization...
📊 Step 1: Connecting to MongoDB...
🔌 Attempting MongoDB connection to: ...
✅ Mongoose successfully connected to MongoDB
✅ MongoDB connection established

📊 Step 2: Seeding admin user...
✅ Admin seed check complete

📊 Step 3: Starting HTTP server...
🎉 Server running on port 5001
```

#### ❌ Failed Startup Patterns:

**Pattern 1: MongoDB Authentication Failed**
```
❌ CRITICAL: Failed to connect to MongoDB on initial attempt
📝 Error Message: bad auth: Authentication failed

🔐 DIAGNOSIS: Authentication Failed
   - Check MONGODB_URI username and password
```
**Fix:** Update `MONGODB_URI` in Render environment variables

---

**Pattern 2: MongoDB Connection Timeout**
```
❌ CRITICAL: Failed to connect to MongoDB on initial attempt
📝 Error Message: connection timed out

⏱️  DIAGNOSIS: Connection Timeout
   - MongoDB Atlas may be blocking this IP address
   - Add 0.0.0.0/0 to Network Access in MongoDB Atlas
```
**Fix:** 
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"
5. Wait 2-3 minutes
6. Redeploy on Render

---

**Pattern 3: Environment Variable Missing**
```
❌ CRITICAL: MONGODB_URI environment variable is not defined
```
**Fix:** Add `MONGODB_URI` in Render dashboard → Environment

---

**Pattern 4: Memory Issues**
```
❌ UNCAUGHT EXCEPTION DETECTED!
Error: JavaScript heap out of memory
```
**Fix:** Render free tier has 512MB RAM limit. Check `/health` endpoint memory usage.

---

## 🚑 Emergency Recovery Steps

### Issue 1: MongoDB Atlas IP Whitelist (Most Common)
**Symptom:** Connection timeout errors

**Solution:**
1. Go to https://cloud.mongodb.com
2. Click your cluster → Network Access
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"
6. Wait 2-3 minutes for propagation
7. Render → Manual Deploy → "Clear build cache & deploy"

---

### Issue 2: MongoDB Credentials Changed
**Symptom:** Authentication failed errors

**Solution:**
1. Go to MongoDB Atlas → Database Access
2. Verify user exists with correct permissions
3. If password changed, update `MONGODB_URI` in Render
4. Format: `mongodb://username:password@host/database?options`
5. URL-encode special characters in password
6. Redeploy

---

### Issue 3: Render Cold Start Timeout
**Symptom:** Health check fails, then succeeds after 30-60s

**Solution:**
- Already fixed with 60s timeout in frontend
- Set up cron job keepalive (see `RENDER_COLD_START_FIX.md`)

---

### Issue 4: Environment Variables Missing
**Symptom:** Server won't start, missing env var errors

**Solution:**
1. Render Dashboard → Your Service → Environment
2. Verify all required variables exist:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Click "Save Changes"
4. Render auto-redeploys

---

### Issue 5: CORS Blocking Requests
**Symptom:** Frontend gets CORS errors

**Solution:**
1. Check Render logs for: `⚠️  CORS: Blocked request from...`
2. Verify `FRONTEND_URL` matches your Vercel URL exactly
3. No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
4. Update and redeploy

---

## 🧪 Testing Your Fixes

### Test 1: Health Check
```bash
curl https://your-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "success": true,
  "database": {
    "connected": true,
    "state": "connected"
  }
}
```

---

### Test 2: Frontend Connection
1. Open browser DevTools → Console
2. Visit your frontend
3. Try to login
4. Check for errors

---

### Test 3: Check Render Logs
1. Render Dashboard → Logs
2. Look for startup sequence
3. Verify all ✅ checkmarks appear
4. No ❌ errors

---

## 📊 Common Error Codes & Meanings

| Code | Meaning | Common Cause |
|------|---------|--------------|
| `ETIMEDOUT` | Connection timeout | MongoDB Atlas IP whitelist |
| `ECONNREFUSED` | Connection refused | MongoDB cluster down or wrong host |
| `ENOTFOUND` | DNS error | Wrong MongoDB hostname |
| `bad auth` | Authentication failed | Wrong credentials or user deleted |
| `11000` | Duplicate key | Trying to create duplicate record |
| `503` | Service unavailable | Database not connected |

---

## 🔧 Render Dashboard Checklist

1. **Environment Variables** (Settings → Environment)
   - [ ] `MONGODB_URI` is set correctly
   - [ ] `JWT_SECRET` exists
   - [ ] `JWT_REFRESH_SECRET` exists
   - [ ] `FRONTEND_URL` matches Vercel URL
   - [ ] Cloudinary credentials set
   - [ ] No typos in variable names

2. **Service Settings** (Settings → General)
   - [ ] Build command: `npm run build`
   - [ ] Start command: `npm start`
   - [ ] Root directory: `backend` (if monorepo)

3. **Health Check** (Settings → Health Check Path)
   - [ ] Set to: `/health`
   - [ ] This enables Render's health monitoring

4. **Logs** (Logs tab)
   - [ ] Check for startup sequence
   - [ ] Look for ✅ success indicators
   - [ ] No ❌ error messages

---

## 📝 Quick Diagnostic Checklist

When your app fails, run through this checklist:

1. **Check Render Logs First**
   - [ ] See startup sequence
   - [ ] Identify error pattern
   - [ ] Note exact error message

2. **Test Health Endpoint**
   - [ ] Visit `/health` in browser
   - [ ] Check `database.connected` field
   - [ ] Note memory usage

3. **Verify MongoDB Atlas**
   - [ ] Cluster is running (not paused)
   - [ ] Network Access allows 0.0.0.0/0
   - [ ] Database user exists with correct permissions

4. **Check Environment Variables**
   - [ ] All required vars present in Render
   - [ ] No typos
   - [ ] Correct values (check MongoDB URI format)

5. **Test Connection Locally**
   - [ ] Copy Render env vars to local `.env`
   - [ ] Run `npm run dev`
   - [ ] If works locally but not Render = IP whitelist issue

---

## 🆘 Still Not Working?

### Gather This Information:
1. **Render logs** (copy last 100 lines)
2. **Health endpoint response** (screenshot or JSON)
3. **Environment variables** (names only, mask sensitive values)
4. **Error pattern** (which diagnostic pattern matches?)
5. **MongoDB Atlas Network Access** (screenshot)

### Then:
1. Check MongoDB Atlas status page
2. Check Render status page
3. Verify Vercel deployment succeeded
4. Try "Clear build cache & deploy" in Render

---

## 🎯 Summary

**Files Modified:**
- ✅ `backend/src/config/database.ts` - Enhanced connection logging
- ✅ `backend/src/server.ts` - Better startup and error logging
- ✅ `backend/src/app.ts` - Improved health check & CORS logging
- ✅ `backend/src/middleware/errorHandler.ts` - Detailed error logging

**What You Get:**
- 🔍 Clear diagnostic messages for common issues
- 🏥 Comprehensive health check with DB status
- 📊 Memory usage monitoring
- 🚨 Explicit error logging with actionable guidance
- 🔐 CORS request visibility
- ⏱️  Render-optimized connection timeouts

**Your health endpoint is now production-grade!** 🚀
