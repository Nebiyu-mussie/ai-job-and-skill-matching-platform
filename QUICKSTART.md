# Quick Start Guide

This guide will help you get the AI Job Platform running on your local machine in minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ Python 3.9+ installed (`python --version` or `python3 --version`)
- ✅ MongoDB running (local or Atlas connection string)

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Backend
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set at minimum:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random string, e.g., "my-super-secret-key-123")
# - JWT_REFRESH_SECRET (another random string)
```

**Minimum .env for testing:**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ai-job-platform
JWT_SECRET=test-jwt-secret-change-in-production
JWT_REFRESH_SECRET=test-refresh-secret-change-in-production
FRONTEND_URL=http://localhost:5173
```

### Step 3: Build and Start Backend
```bash
npm run build
npm run dev
```

The backend should now be running on http://localhost:5001

### Step 4: Install Frontend Dependencies (New Terminal)
```bash
cd frontend
npm install
```

### Step 5: Configure Frontend
```bash
# Copy the example env file
cp .env.example .env

# The default values should work:
# VITE_API_URL=http://localhost:5001/api/v1
```

### Step 6: Start Frontend
```bash
npm run dev
```

The frontend should now be running on http://localhost:5173

### Step 7: Install AI Service Dependencies (New Terminal)
```bash
cd ai-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

### Step 8: Configure AI Service
```bash
# Copy the example env file
cp .env.example .env

# Edit if needed, defaults should work:
# PORT=8000
# AI_SERVICE_API_KEY=your-api-key
```

### Step 9: Start AI Service
```bash
python main.py
```

The AI service should now be running on http://localhost:8000

## ✅ Verify Everything Works

1. Open your browser and go to http://localhost:5173
2. You should see the landing page
3. Try registering a new account
4. Check the backend terminal for any errors

## 🎯 What's Next?

### Create Test Data

1. Register as a Job Seeker:
   - Go to http://localhost:5173/register
   - Select "Job Seeker" role
   - Fill in your details

2. Register as an Employer:
   - Open a new incognito/private window
   - Go to http://localhost:5173/register
   - Select "Employer" role
   - Fill in company details

3. Post a Job (as Employer):
   - Login as employer
   - Go to "Post Job"
   - Fill in job details

4. Upload Resume (as Job Seeker):
   - Login as job seeker
   - Go to "Resume Manager"
   - Upload your resume (PDF or DOCX)

5. Check Matches:
   - Go to "Job Matches"
   - See AI-powered job recommendations

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check if port 5001 is available

### Frontend won't start
- Check if backend is running first
- Verify VITE_API_URL in .env
- Clear npm cache: `npm cache clean --force`

### AI Service won't start
- Verify Python version: `python --version` (needs 3.9+)
- Reinstall dependencies: `pip install -r requirements.txt`
- Make sure spaCy model is downloaded: `python -m spacy download en_core_web_sm`

### Can't connect to MongoDB
- If using local MongoDB, ensure it's running: `mongod`
- If using MongoDB Atlas, check your connection string
- Make sure your IP is whitelisted in MongoDB Atlas

### Build errors
Backend:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

Frontend:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Full README](./README.md) - Complete documentation
- Backend API: http://localhost:5001/health
- AI Service Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## 🔑 Default Admin Credentials

If you run the seeder script (see backend/src/utils/seeder.ts):
```
Email: admin@platform.com
Password: Admin@123
```

To run seeder:
```bash
cd backend
npm run dev
# Then make a POST request to /api/v1/seed (development only)
```

## 💡 Tips

1. **Use MongoDB Compass** to view your database visually
2. **Use Postman** to test API endpoints
3. **Check browser console** for frontend errors
4. **Check terminal logs** for backend/AI service errors
5. **Use React DevTools** for debugging React components

## 🎉 Success!

If all three services are running without errors, you're ready to explore the platform!

Visit http://localhost:5173 and start matching jobs! 🚀
