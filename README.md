# AI-Based Job & Skill Matching Platform

A comprehensive AI-powered job matching platform that connects job seekers with employers using intelligent matching algorithms, resume parsing, and personalized recommendations.

## 🚀 Features

### For Job Seekers
- **AI-Powered Job Matching** - Get matched with jobs based on your skills and experience
- **Resume Parser** - Automatic extraction of skills, experience, and education from resumes
- **Skill Gap Analysis** - Identify skills needed for desired positions
- **Personalized Recommendations** - Job and course recommendations based on your profile
- **Application Tracking** - Track your job applications in one place
- **Real-time Notifications** - Get notified about new matches and application updates

### For Employers
- **Smart Candidate Ranking** - AI ranks candidates based on job requirements
- **Job Posting & Management** - Easy job posting with requirement specification
- **Application Management** - Review and manage applications efficiently
- **Candidate Search** - Search for candidates by skills and experience
- **Analytics Dashboard** - Track job performance and application metrics

### For Administrators
- **User Management** - Manage users, employers, and permissions
- **Employer Verification** - Verify and approve employer accounts
- **Audit Logs** - Complete audit trail of platform activities
- **Analytics** - Platform-wide analytics and insights

## 🏗️ Architecture

The platform consists of three main components:

1. **Backend API** (Node.js + TypeScript + Express)
   - RESTful API
   - MongoDB database
   - Socket.IO for real-time features
   - JWT authentication
   - Cloudinary for file storage

2. **AI Service** (Python + FastAPI)
   - Resume parsing
   - Job matching algorithms
   - Skill extraction
   - Embeddings generation
   - NLP processing

3. **Frontend** (React + TypeScript + Vite)
   - Modern UI with Tailwind CSS
   - React Query for data fetching
   - Zustand for state management
   - Socket.IO client for real-time updates

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-job-platform
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# - MongoDB connection string
# - JWT secret
# - Cloudinary credentials
# - Email service credentials

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL if needed

# Start development server
npm run dev
```

### 4. AI Service Setup
```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env file
cp .env.example .env

# Update .env with configuration

# Start service
python main.py
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/ai-job-platform

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@jobplatform.com

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

### AI Service (.env)
```env
PORT=8000
ENVIRONMENT=development
BACKEND_URL=http://localhost:5001
AI_SERVICE_API_KEY=your-api-key
WORKERS=1
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend**
```bash
cd backend
npm run dev
```

2. **Start Frontend**
```bash
cd frontend
npm run dev
```

3. **Start AI Service**
```bash
cd ai-service
python main.py
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- AI Service: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📝 API Documentation

The backend API is documented and available at `/api/v1` endpoints. The AI Service has interactive API documentation at `/docs` (Swagger UI).

### Main Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

#### Jobs
- `GET /api/v1/jobs` - List jobs
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs` - Create job (employer)
- `PUT /api/v1/jobs/:id` - Update job (employer)

#### Applications
- `GET /api/v1/applications` - Get my applications
- `POST /api/v1/applications` - Apply to job
- `PATCH /api/v1/applications/:id/status` - Update status (employer)

#### Matching
- `GET /api/v1/matches/my-matches` - Get job matches
- `GET /api/v1/matches/job/:jobId` - Get match score for job
- `GET /api/v1/matches/skill-gap/:jobId` - Get skill gap analysis

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- MongoDB injection prevention
- XSS protection
- API key authentication for AI service

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI Service tests
cd ai-service
pytest
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Output in dist/ folder
```

### AI Service
```bash
cd ai-service
# Use gunicorn or uvicorn with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🐳 Docker Deployment

(Docker configuration coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- spaCy for NLP capabilities
- Sentence Transformers for embeddings
- MongoDB for database
- React and the React ecosystem
- FastAPI for Python backend

## 📧 Contact

For questions or support, please contact [your-email@example.com]

---

Built with ❤️ using modern web technologies
