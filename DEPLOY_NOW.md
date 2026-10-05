# 🚀 Deploy AI Job Platform - Quick Start

**Time to Deploy: ~15 minutes**

Your code is ready. Follow these steps to get your platform live!

---

## ✅ Prerequisites (Already Done)
- [x] Code pushed to GitHub
- [x] MongoDB Atlas configured
- [x] Cloudinary credentials added

---

## 🎯 Step 1: Deploy Backend to Render (8 minutes)

### 1.1 Sign Up / Login to Render
Go to: **https://dashboard.render.com**
- Sign up with your GitHub account (easiest)
- Or create account with email

### 1.2 Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** to link your GitHub
4. Find and select your repo: **`ai-job-and-skill-matching-platform`**
5. Click **"Connect"**

### 1.3 Configure Service Settings

Fill in these **EXACT** values:

```
Name: ai-job-platform-backend
Region: Oregon (US West) - or closest to your location
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**Instance Type:**
- Choose **"Free"** (good for testing)
- Or **"Starter - $7/month"** (recommended for production - better performance)

### 1.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Copy and paste these **12 variables** (one at a time):

```bash
NODE_ENV=production

MONGODB_URI=mongodb://mekdidagne96_db_user:PtwIm90GaokfMC1B@ac-ic72jfv-shard-00-00.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-01.jay1rp3.mongodb.net:27017,ac-ic72jfv-shard-00-02.jay1rp3.mongodb.net:27017/job_matching_db?ssl=true&replicaSet=atlas-oryf5l-shard-0&authSource=admin&appName=Cluster0

JWT_SECRET=ai-job-platform-secret-key-2026-production-change-this

JWT_REFRESH_SECRET=ai-job-platform-refresh-secret-2026-production-change-this

JWT_EXPIRE=15m

JWT_REFRESH_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=h9gvkqvi

CLOUDINARY_API_KEY=567597521863732

CLOUDINARY_API_SECRET=3Q5ilkcaI5Dh6Pn5fTP_ogpT2H4

FRONTEND_URL=https://temp-will-update-later.vercel.app

AI_SERVICE_URL=http://localhost:8000

AI_SERVICE_API_KEY=dev-api-key-12345
```

### 1.5 Deploy!
1. Click **"Create Web Service"** (bottom)
2. Wait 5-8 minutes for build to complete
3. ✅ You'll see "Live" status when done

### 1.6 Copy Your Backend URL
Once deployed, copy the URL (looks like):
```
https://ai-job-platform-backend-xxxx.onrender.com
```

**Save this URL!** You'll need it for the frontend.

---

## 🎨 Step 2: Deploy Frontend to Vercel (5 minutes)

### 2.1 Sign Up / Login to Vercel
Go to: **https://vercel.com/login**
- Sign up with your GitHub account (recommended)

### 2.2 Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import"** next to your repo: `ai-job-and-skill-matching-platform`
3. If you don't see it, click **"Import Git Repository"** and paste:
   ```
   https://github.com/Nebiyu-mussie/ai-job-and-skill-matching-platform
   ```

### 2.3 Configure Project Settings

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build (auto-detected)
Output Directory: dist (auto-detected)
Install Command: npm install (auto-detected)
```

### 2.4 Add Environment Variable

Click **"Environment Variables"** section

Add this variable:
```
Key: VITE_API_URL
Value: https://[YOUR-RENDER-BACKEND-URL]/api/v1
```

**Example:**
```
VITE_API_URL=https://ai-job-platform-backend-xxxx.onrender.com/api/v1
```

⚠️ **Important:** Replace `[YOUR-RENDER-BACKEND-URL]` with your actual Render URL from Step 1.6

### 2.5 Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ You'll see "Congratulations" when done

### 2.6 Copy Your Frontend URL
Your live site URL will be:
```
https://[your-project-name].vercel.app
```

**Save this URL!**

---

## 🔗 Step 3: Connect Frontend & Backend (2 minutes)

### 3.1 Update Render Backend
1. Go back to **Render Dashboard**
2. Click on your **"ai-job-platform-backend"** service
3. Go to **"Environment"** tab
4. Find **`FRONTEND_URL`** variable
5. Click **"Edit"** and change to your Vercel URL:
   ```
   https://[your-project-name].vercel.app
   ```
6. Click **"Save Changes"**
7. Service will auto-redeploy (~2 minutes)

---

## 🎉 Step 4: Test Your Live Platform!

### 4.1 Visit Your Site
Open your Vercel URL:
```
https://[your-project-name].vercel.app
```

### 4.2 Test Login with Seeded Accounts

**Job Seeker Account:**
```
Email: abebe.kebede@email.com
Password: JobSeeker@123
```

**Employer Account:**
```
Email: hr@ethiotelecom.com
Password: Employer@123
```

**Admin Account:**
```
Email: admin@aijobplatform.com
Password: Admin@123
```

### 4.3 Test Key Features
- ✅ Login/Logout
- ✅ Profile picture upload
- ✅ Browse jobs
- ✅ Apply for jobs
- ✅ Real-time notifications (Socket.io)

---

## 📊 Your Live URLs Summary

After deployment, save these:

```
Frontend (Vercel):  https://[your-project].vercel.app
Backend (Render):   https://ai-job-platform-backend-xxxx.onrender.com
Database (MongoDB): Atlas (already configured)
File Storage:       Cloudinary (configured)
```

---

## 🐛 Troubleshooting

### Backend Build Fails
- Check Render logs in dashboard
- Ensure all 12 environment variables are set
- MongoDB URI should have no line breaks

### Frontend Build Fails
- Check Vercel deployment logs
- Ensure `VITE_API_URL` ends with `/api/v1`
- Ensure backend URL is correct (no trailing slash)

### CORS Errors
- Check `FRONTEND_URL` in Render matches your Vercel URL exactly
- Wait for Render to finish redeploying after changing env vars

### Socket.io Not Working
- Free tier Render services sleep after 15 min inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to Starter tier ($7/mo) for always-on

### Profile Uploads Fail
- Check Cloudinary credentials are correct in Render
- Test credentials at: https://cloudinary.com/console

---

## 💡 Next Steps (Optional)

### Custom Domain
**Vercel:**
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as shown

**Render:**
- Go to Settings → Custom Domain
- Add your domain
- Update DNS records

### Production Security
Update these in Render environment:
```
JWT_SECRET=[generate new strong secret]
JWT_REFRESH_SECRET=[generate new strong secret]
```

Use: https://randomkeygen.com/ (256-bit WPA Key recommended)

### Enable AI Features
Deploy the AI service to a Python hosting platform:
- Railway.app (recommended)
- Render (Python runtime)
- Heroku

Update `AI_SERVICE_URL` in Render to point to your AI service.

---

## 🎊 Success!

Your AI Job Matching Platform is now live! 🚀

**Share your platform:**
- Share Vercel URL with friends/employers
- Post on LinkedIn/social media
- Add to your portfolio

Need help? Check the logs in Render/Vercel dashboards.

---

**Estimated Total Time:** 15-20 minutes
**Cost:** Free tier works, $7/month Render Starter recommended for production
