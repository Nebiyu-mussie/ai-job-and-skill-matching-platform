# 🚀 Deployment Checklist

## ✅ Pre-Deployment

### 1. Cloudinary Setup (REQUIRED)
- [ ] Sign up at https://cloudinary.com
- [ ] Get Cloud Name, API Key, and API Secret
- [ ] Add credentials to backend `.env`

### 2. GitHub Repository
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Verify all files uploaded

### 3. Environment Variables Ready
- [ ] MongoDB connection string
- [ ] JWT secrets
- [ ] Cloudinary credentials
- [ ] All documented

---

## 🔧 Backend Deployment

### Vercel Setup
- [ ] Import project to Vercel
- [ ] Set root directory to `backend`
- [ ] Configure build command: `npm run build`

### Environment Variables
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL (update after frontend deployed)
- [ ] AI_SERVICE_URL

### Verification
- [ ] Deploy backend
- [ ] Test `/health` endpoint
- [ ] Check Function logs for errors
- [ ] Copy backend URL

---

## 🎨 Frontend Deployment

### Vercel Setup
- [ ] Import project to Vercel
- [ ] Set root directory to `frontend`
- [ ] Framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] VITE_API_URL=https://your-backend.vercel.app/api/v1

### Verification
- [ ] Deploy frontend
- [ ] Visit frontend URL
- [ ] Test login page loads
- [ ] Copy frontend URL

---

## 🔄 Post-Deployment

### Update Cross-References
- [ ] Update backend `FRONTEND_URL` env variable
- [ ] Update CORS in `backend/src/app.ts`
- [ ] Push CORS changes to GitHub
- [ ] Redeploy backend

### Full Testing
- [ ] Register new account
- [ ] Login with test account
- [ ] Update profile
- [ ] Upload profile picture
- [ ] Browse jobs
- [ ] Apply to job
- [ ] Check MongoDB for saved data

---

## 🤖 Optional: AI Service

### Render Deployment
- [ ] Sign up at https://render.com
- [ ] Create new Web Service
- [ ] Connect GitHub repo
- [ ] Set root directory: `ai-service`
- [ ] Build: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
- [ ] Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Deploy

### Update Backend
- [ ] Copy Render URL
- [ ] Update backend `AI_SERVICE_URL`
- [ ] Redeploy backend

---

## 🔐 Security

- [ ] Change JWT secrets to strong random strings
- [ ] Never commit `.env` files
- [ ] Verify HTTPS enabled (automatic on Vercel)
- [ ] Test rate limiting working

---

## 📊 Final Verification

### Frontend
- [ ] Landing page loads
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard accessible
- [ ] Profile page works
- [ ] File upload works

### Backend
- [ ] Health endpoint responds
- [ ] API endpoints working
- [ ] Authentication working
- [ ] MongoDB connected
- [ ] No errors in logs

### Database
- [ ] Data persists in MongoDB Atlas
- [ ] New users can register
- [ ] Profile updates save
- [ ] File URLs saved correctly

---

## 🎯 Deployment URLs

```
Frontend:  https://_______________.vercel.app
Backend:   https://_______________.vercel.app
AI Service: https://_______________.onrender.com
```

---

## ✅ COMPLETED

**Date Deployed:** _______________

**Deployed By:** _______________

**Notes:**
- 
- 
- 

---

**🎉 Deployment Complete! Your app is now live!**
