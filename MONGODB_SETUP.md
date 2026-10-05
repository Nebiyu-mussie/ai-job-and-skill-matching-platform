# MongoDB Atlas Connection Setup Guide

## Current Status
- **Your Current IP:** 102.203.225.163
- **Connection String:** mongodb+srv://Neba:***@cluster0.fojrp1c.mongodb.net/
- **Issue:** IP not whitelisted

## Quick Fix Steps

### 1. Go to MongoDB Atlas
https://cloud.mongodb.com

### 2. Navigate to Network Access
- Click on your project
- In the left sidebar, click **"Network Access"**

### 3. Whitelist Your IP
Click **"Add IP Address"** and choose ONE of these options:

**Option A: Whitelist All IPs (Easiest for Development)**
```
IP Address: 0.0.0.0/0
Comment: Allow from anywhere (development only)
```
⚠️ Note: This is less secure but works from any location

**Option B: Whitelist Current IP (More Secure)**
```
IP Address: 102.203.225.163
Comment: My current IP
```
⚠️ Note: You'll need to update this if your IP changes

### 4. Wait for Propagation
- Changes can take 2-5 minutes to take effect globally
- You'll see a green "Active" status when ready

### 5. Verify Database User
- Click **"Database Access"** in left sidebar
- Ensure user **"Neba"** exists
- Role should be: **"Atlas admin"** or **"readWriteAnyDatabase"**

## Testing the Connection

After whitelisting, run:
```bash
cd ai-job-platform/backend
node mongodb-diagnostics.js
```

You should see:
```
✅ SUCCESS! Connected to MongoDB
```

## If Still Not Working

### Check 1: Verify Connection String
Make sure `backend/.env` has:
```env
MONGODB_URI=mongodb+srv://Neba:Neba1994@cluster0.fojrp1c.mongodb.net/ai-job-platform?retryWrites=true&w=majority&appName=Cluster0
```

### Check 2: Check Password
- Password might contain special characters that need URL encoding
- Try resetting the password in MongoDB Atlas

### Check 3: Firewall
- Check if your firewall is blocking outbound connections to port 27017
- Try temporarily disabling firewall/VPN

## Common Errors

### "Could not connect to any servers"
→ IP not whitelisted yet or still propagating

### "Authentication failed"
→ Wrong username or password

### "ENOTFOUND" or "timeout"
→ Network/DNS issue or firewall blocking

## Alternative: Use Local MongoDB

If Atlas continues to have issues:
```bash
# Install MongoDB locally (Mac)
brew install mongodb-community
brew services start mongodb-community

# Update backend/.env
MONGODB_URI=mongodb://localhost:27017/ai-job-platform
```

Then restart backend:
```bash
cd ai-job-platform/backend
npm run dev
```
