# ⚡ Quick Deploy: Render + Vercel (10 Minutes)

## 🎯 What You'll Deploy

✅ Backend (Node.js + Socket.io) → **Render**  
✅ Frontend (React + Vite) → **Vercel**  
✅ Database → **MongoDB Atlas** (already set up)

---

## ⏱️ Step 1: Get Cloudinary (2 min)

1. Go to https://cloudinary.com → Sign up (Free)
2. Dashboard → Copy these 3 values:
   - Cloud Name
   - API Key
   - API Secret
3. Keep them ready for step 3

---

## 🐙 Step 2: Push to GitHub (1 min)

```bash
cd "/Users/Neba/final project/ai-job-platform"

git init
git add .
git commit -m "Ready for Render + Vercel deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-job-platform.git
git push -u origin main
```

---

## 🎨 Step 3: Deploy Backend to Render (4 min)

### 3.1 Create Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select your repository

### 3.2 Configure
- **Name:** `ai-job-backend` (or your choice)
- **Region:** Oregon
- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** Free

### 3.3 Environment Variables

Click **"Advanced"** → Add these 12 variables:

```env
NODE_ENV=production

MONGODB_URI=mongodb://mekdidagne96_db_user:PtwIm90GaokfMC1B@ac-ic72jfv-shard-00-00.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-01.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-02.jay1rp3.mongodb.net:27017/job_matching_db?ssl=true&replicaSet=atlas-oryf5l-shard-0&authSource=admin&appName=Cluster0

JWT_SECRET=ai-job-platform-secret-key-2026-production

JWT_REFRESH_SECRET=ai-job-platform-refresh-secret-2026-production

JWT_EXPIRE=15m

JWT_REFRESH_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=[YOUR_CLOUDINARY_CLOUD_NAME]

CLOUDINARY_API_KEY=[YOUR_CLOUDINARY_API_KEY]

CLOUDINARY_API_SECRET=[YOUR_CLOUDINARY_API_SECRET]

FRONTEND_URL=https://temp-will-update.com

AI_SERVICE_URL=http://localhost:8000

AI_SERVICE_API_KEY=dev-api-key-12345
```

### 3.4 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes
3. Copy your URL: `https://your-backend.onrender.com`
4. Test: Visit `https://your-backend.onrender.com/health`

---

## ▲ Step 4: Deploy Frontend to Vercel (2 min)

### 4.1 Import Project
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select **Root Directory:** `frontend`

### 4.2 Configure
- **Framework:** Vite (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 4.3 Add Environment Variable

Click **"Environment Variables"** → Add:

```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

⚠️ Replace `your-backend.onrender.com` with your actual Render URL

### 4.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your URL: `https://your-app.vercel.app`

---

## 🔄 Step 5: Update Backend URL (1 min)

### 5.1 Update Render
1. Render Dashboard → Your backend service
2. **Environment** tab
3. Edit `FRONTEND_URL`
4. Change to: `https://your-app.vercel.app`
5. Save (auto-redeploys)

---

## ✅ Step 6: Test Everything!

### 6.1 Visit Your App
Go to: `https://your-app.vercel.app`

### 6.2 Test Flow
1. Click "Login"
2. Login: `abebe.kebede@email.com` / `JobSeeker@123`
3. Go to **Profile**
4. Update your name
5. Upload profile picture
6. Check browser console for Socket.io: `✅ Socket.io connected`

**If all works → YOU'RE DONE!** 🎉

---

## 🐛 Troubleshooting

### ❌ "Network Error"
- Check `FRONTEND_URL` in Render matches Vercel URL exactly
- No trailing slashes
- Redeploy backend

### ❌ Profile Upload Fails
- Verify all 3 Cloudinary credentials in Render
- Check spelling/spacing

### ❌ Backend Shows Error
- Render → Your service → **Logs**
- Check for MongoDB connection errors
- Verify all env variables are set

---

## 📊 Your Deployment

Write down your URLs:

```
Frontend:  https://________________.vercel.app
Backend:   https://________________.onrender.com
```

---

## 🎊 Success Metrics

After deployment, you have:

✅ **Backend API** - Running on Render with Socket.io  
✅ **Frontend App** - Deployed on Vercel  
✅ **Database** - Connected to MongoDB Atlas  
✅ **File Storage** - Using Cloudinary  
✅ **Real-time** - Socket.io working  
✅ **Secure** - HTTPS, CORS, JWT  
✅ **Free** - $0/month on free tiers  
✅ **Professional** - Production-ready architecture  

---

## 📚 Need More Help?

- **Full Guide:** See `DEPLOYMENT_GUIDE_RENDER_VERCEL.md`
- **Env Variables:** See `ENV_VARIABLES_CHECKLIST.md`
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

**⏱️ Total Time: ~10 minutes**  
**💰 Total Cost: $0/month**  
**🚀 Status: LIVE & ACCESSIBLE WORLDWIDE!**

---

**🎉 Congratulations! Your AI Job Platform is now deployed!**

Share your live URL with:
- Portfolio websites
- LinkedIn profile
- University professors
- Potential employers
- Friends and colleagues

**You've just deployed a production-grade full-stack application!** 🌟
