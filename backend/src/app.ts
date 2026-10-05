import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { logger } from './utils/logger';
import { morganStream } from './utils/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import employerRoutes from './routes/employer.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import resumeRoutes from './routes/resume.routes';
import skillRoutes from './routes/skill.routes';
import notificationRoutes from './routes/notification.routes';
import messageRoutes from './routes/message.routes';
import matchRoutes from './routes/match.routes';
import recommendationRoutes from './routes/recommendation.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import courseRoutes from './routes/course.routes';

const app: Application = express();

// Trust proxy (for Render deployment)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'res.cloudinary.com'],
    },
  },
}));

// CORS Configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is allowed or is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: morganStream }));
}

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp({
  whitelist: ['skills', 'tags', 'jobType', 'experienceLevel', 'salary'],
}));

// Compression
app.use(compression());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AI Job Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/employers`, employerRoutes);
app.use(`/api/${apiVersion}/jobs`, jobRoutes);
app.use(`/api/${apiVersion}/applications`, applicationRoutes);
app.use(`/api/${apiVersion}/resumes`, resumeRoutes);
app.use(`/api/${apiVersion}/skills`, skillRoutes);
app.use(`/api/${apiVersion}/notifications`, notificationRoutes);
app.use(`/api/${apiVersion}/messages`, messageRoutes);
app.use(`/api/${apiVersion}/matches`, matchRoutes);
app.use(`/api/${apiVersion}/recommendations`, recommendationRoutes);
app.use(`/api/${apiVersion}/analytics`, analyticsRoutes);
app.use(`/api/${apiVersion}/admin`, adminRoutes);
app.use(`/api/${apiVersion}/bookmarks`, bookmarkRoutes);
app.use(`/api/${apiVersion}/courses`, courseRoutes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
