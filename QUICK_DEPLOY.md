# ⚡ Quick Deploy to Vercel - 5 Minutes

## 🎯 What You Need

1. ☁️ **Cloudinary Account** (Free) - https://cloudinary.com
2. 🐙 **GitHub Account** - https://github.com
3. ▲ **Vercel Account** - https://vercel.com

---

## 📝 Step 1: Get Cloudinary Credentials (2 min)

1. Go to https://cloudinary.com and sign up
2. After login, go to **Dashboard**
3. Copy these 3 values:
   - **Cloud Name**: `dxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz`

---

## 🐙 Step 2: Push to GitHub (1 min)

```bash
cd /Users/Neba/final\ project/ai-job-platform

# Initialize git
git init
git add .
git commit -m "Initial deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-job-platform.git
git push -u origin main
```

---

## ▲ Step 3: Deploy Backend (1 min)

1. Go to https://vercel.com/new
2. **Import** your GitHub repository
3. Select **Root Directory**: `backend`
4. Click **"Environment Variables"**
5. **Add these variables:**

```
MONGODB_URI=mongodb://mekdidagne96_db_user:PtwIm90GaokfMC1B@ac-ic72jfv-shard-00-00.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-01.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-02.jay1rp3.mongodb.net:27017/job_matching_db?ssl=true&replicaSet=atlas-oryf5l-shard-0&authSource=admin&appName=Cluster0

JWT_SECRET=ai-job-platform-secret-key-2026-production-change-this
JWT_REFRESH_SECRET=ai-job-platform-refresh-secret-2026-production-change-this

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME_HERE
CLOUDINARY_API_KEY=YOUR_API_KEY_HERE
CLOUDINARY_API_SECRET=YOUR_API_SECRET_HERE

NODE_ENV=production
FRONTEND_URL=https://temp-will-update-later.com
AI_SERVICE_URL=http://localhost:8000
```

6. Click **"Deploy"**
7. Wait ~2 minutes
8. **Copy the backend URL** (e.g., `https://ai-job-backend.vercel.app`)

---

## ▲ Step 4: Deploy Frontend (1 min)

1. Go to https://vercel.com/new again
2. **Import** your GitHub repository (same repo)
3. Select **Root Directory**: `frontend`
4. Click **"Environment Variables"**
5. **Add this variable:**

```
VITE_API_URL=https://YOUR_BACKEND_URL_FROM_STEP_3/api/v1
```

6. Click **"Deploy"**
7. Wait ~2 minutes
8. **Copy the frontend URL** (e.g., `https://ai-job-platform.vercel.app`)

---

## 🔄 Step 5: Update Backend URL (30 sec)

1. Go to Vercel → Your **Backend** project
2. Click **Settings** → **Environment Variables**
3. Edit `FRONTEND_URL`
4. Change to your frontend URL from Step 4
5. Click **Save**
6. Go to **Deployments** tab
7. Click **...** on latest deployment → **Redeploy**

---

## ✅ Step 6: Test Your App!

1. Visit your frontend URL: `https://your-app.vercel.app`
2. Click **"Login"**
3. Login with: `abebe.kebede@email.com` / `JobSeeker@123`
4. Go to **Profile** page
5. Try updating your name
6. Try uploading a profile picture

**If everything works - YOU'RE DONE!** 🎉

---

## 🐛 Troubleshooting

### ❌ "Network Error" or "CORS Error"

**Fix:**
1. Make sure `FRONTEND_URL` in backend matches your actual frontend URL
2. Redeploy backend after updating

### ❌ Profile Picture Upload Fails

**Fix:**
1. Verify Cloudinary credentials are correct
2. Check you added all 3 Cloudinary variables

### ❌ "500 Internal Server Error"

**Fix:**
1. Go to Vercel → Backend project → **Deployments**
2. Click on the deployment → **View Function Logs**
3. Check error messages
4. Usually means MongoDB connection or missing env variable

---

## 🎯 Your Deployment URLs

Write them down:

```
Frontend:  https://________________.vercel.app
Backend:   https://________________.vercel.app
```

---

## 🎊 Success!

Your AI Job Platform is now live and accessible worldwide!

**Share your link with:**
- Friends
- Potential employers
- On LinkedIn
- In your portfolio

---

## 📚 Need More Help?

See the full deployment guide: `DEPLOYMENT_GUIDE.md`

---

**Total Time: ~5 minutes** ⚡
**Cost: $0/month** 💰
**Status: LIVE** 🚀
