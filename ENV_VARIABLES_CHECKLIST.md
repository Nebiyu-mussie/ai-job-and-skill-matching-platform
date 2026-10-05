# 📋 Environment Variables Checklist

## 🎨 Render (Backend) - 12 Variables

Copy and paste these into Render Dashboard → Environment Variables:

### Required Variables

```
NODE_ENV
production

MONGODB_URI
mongodb://mekdidagne96_db_user:PtwIm90GaokfMC1B@ac-ic72jfv-shard-00-00.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-01.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-02.jay1rp3.mongodb.net:27017/job_matching_db?ssl=true&replicaSet=atlas-oryf5l-shard-0&authSource=admin&appName=Cluster0

JWT_SECRET
ai-job-platform-secret-key-2026-production-change-this-to-random

JWT_REFRESH_SECRET
ai-job-platform-refresh-secret-2026-production-change-this-to-random

JWT_EXPIRE
15m

JWT_REFRESH_EXPIRE
7d

CLOUDINARY_CLOUD_NAME
[GET FROM CLOUDINARY DASHBOARD]

CLOUDINARY_API_KEY
[GET FROM CLOUDINARY DASHBOARD]

CLOUDINARY_API_SECRET
[GET FROM CLOUDINARY DASHBOARD]

FRONTEND_URL
[UPDATE AFTER DEPLOYING FRONTEND - e.g., https://your-app.vercel.app]

AI_SERVICE_URL
http://localhost:8000

AI_SERVICE_API_KEY
dev-api-key-12345
```

---

## ▲ Vercel (Frontend) - 1 Variable

Copy and paste this into Vercel Dashboard → Environment Variables:

```
VITE_API_URL
[UPDATE WITH YOUR RENDER URL - e.g., https://your-backend.onrender.com/api/v1]
```

---

## ☁️ Cloudinary Setup (Required)

### 1. Sign Up
- Go to: https://cloudinary.com
- Create free account

### 2. Get Credentials
- Login → Dashboard
- Copy these 3 values:

```
Cloud Name:  dxxxxxxx
API Key:     123456789012345
API Secret:  abcdefghijklmnopqrstuvwxyz123456
```

### 3. Add to Render
- Paste into Render environment variables:
  - CLOUDINARY_CLOUD_NAME = [Cloud Name]
  - CLOUDINARY_API_KEY = [API Key]
  - CLOUDINARY_API_SECRET = [API Secret]

---

## 🔐 Generate Strong JWT Secrets (Recommended)

### On Your Local Machine:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Copy the generated strings and update in Render:
- Replace `JWT_SECRET` value
- Replace `JWT_REFRESH_SECRET` value
- Click "Save Changes"

---

## ✅ Final Checklist

### Before Deploying Backend (Render):
- [ ] Have MongoDB connection string
- [ ] Have Cloudinary credentials (all 3)
- [ ] JWT secrets ready (default or generated)
- [ ] All 12 environment variables prepared

### Before Deploying Frontend (Vercel):
- [ ] Backend deployed and URL copied
- [ ] `VITE_API_URL` prepared with backend URL + `/api/v1`

### After Both Deployed:
- [ ] Updated `FRONTEND_URL` in Render backend
- [ ] Redeployed backend (automatic on Render)
- [ ] Tested full flow (register → login → profile)

---

## 🎯 Quick Copy Format for Render

**Name** | **Value**
--- | ---
`NODE_ENV` | `production`
`MONGODB_URI` | `[your-mongodb-connection-string]`
`JWT_SECRET` | `[your-generated-or-default-secret]`
`JWT_REFRESH_SECRET` | `[your-generated-or-default-secret]`
`JWT_EXPIRE` | `15m`
`JWT_REFRESH_EXPIRE` | `7d`
`CLOUDINARY_CLOUD_NAME` | `[from-cloudinary-dashboard]`
`CLOUDINARY_API_KEY` | `[from-cloudinary-dashboard]`
`CLOUDINARY_API_SECRET` | `[from-cloudinary-dashboard]`
`FRONTEND_URL` | `[your-vercel-url-after-deploying]`
`AI_SERVICE_URL` | `http://localhost:8000`
`AI_SERVICE_API_KEY` | `dev-api-key-12345`

---

## 🎯 Quick Copy Format for Vercel

**Name** | **Value**
--- | ---
`VITE_API_URL` | `[your-render-url]/api/v1`

Example: `https://ai-job-backend-xyz.onrender.com/api/v1`

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Forgetting `/api/v1` in VITE_API_URL**
   - ✅ Correct: `https://backend.onrender.com/api/v1`
   - ❌ Wrong: `https://backend.onrender.com`

2. ❌ **Adding trailing slash**
   - ✅ Correct: `https://frontend.vercel.app`
   - ❌ Wrong: `https://frontend.vercel.app/`

3. ❌ **Using http instead of https**
   - ✅ Both Render and Vercel automatically provide HTTPS

4. ❌ **Forgetting to update FRONTEND_URL after deploying**
   - Must update backend env after frontend is live

5. ❌ **Missing Cloudinary credentials**
   - All 3 are required: Cloud Name, API Key, API Secret

---

## ✅ All Set!

You now have:
- ✅ Complete list of all environment variables
- ✅ Cloudinary setup instructions
- ✅ JWT secret generation commands
- ✅ Common mistakes to avoid
- ✅ Ready to deploy!

Follow the main deployment guide: `RENDER_VERCEL_DEPLOY.md`
