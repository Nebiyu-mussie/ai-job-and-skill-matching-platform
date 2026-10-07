import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';
import { initSocket } from './config/socket';
import { logger } from './utils/logger';
import { createServer } from 'http';
import { seedAdmin } from './utils/seeder';

const PORT = parseInt(process.env.PORT || '5000', 10);

const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting server initialization...');
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
    console.log(`🤖 AI Service URL: ${process.env.AI_SERVICE_URL || 'Not set'}`);
    
    // Attempt database connection
    console.log('\n📊 Step 1: Connecting to MongoDB...');
    await connectDB();
    logger.info('✅ MongoDB connected successfully');
    console.log('✅ MongoDB connection established\n');

    // Seed admin if needed
    console.log('📊 Step 2: Seeding admin user (if not exists)...');
    await seedAdmin();
    console.log('✅ Admin seed check complete\n');

    // Start HTTP server
    console.log('📊 Step 3: Starting HTTP server...');
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log('\n🎉 ===================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Environment: ${process.env.NODE_ENV}`);
      console.log(`📖 API Docs: http://localhost:${PORT}/api/v1/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log('🎉 ===================================\n');
      
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📖 API Docs: http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error: any) {
    console.error('\n❌ =========================================');
    console.error('❌ CRITICAL: Failed to start server');
    console.error('❌ =========================================');
    console.error('Error details:', error);
    
    if (error.message) {
      console.error(`\n📝 Error Message: ${error.message}`);
    }
    
    if (error.stack) {
      console.error(`\n📚 Stack Trace:\n${error.stack}`);
    }
    
    // Provide actionable guidance
    console.error('\n🔍 TROUBLESHOOTING STEPS:');
    console.error('1. Check that all environment variables are set in Render dashboard');
    console.error('2. Verify MONGODB_URI is correct and MongoDB Atlas is accessible');
    console.error('3. Check Network Access in MongoDB Atlas (add 0.0.0.0/0 to allow all IPs)');
    console.error('4. Verify MongoDB Atlas cluster is not paused');
    console.error('5. Check Render logs for more details: https://dashboard.render.com');
    console.error('❌ =========================================\n');
    
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('\n❌ ==========================================');
  console.error('❌ UNHANDLED PROMISE REJECTION DETECTED!');
  console.error('❌ ==========================================');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  
  if (reason?.message) {
    console.error(`Message: ${reason.message}`);
  }
  if (reason?.stack) {
    console.error(`Stack:\n${reason.stack}`);
  }
  
  logger.error('Unhandled Rejection:', { reason, promise });
  
  console.error('\n🔄 Attempting graceful shutdown...');
  httpServer.close(() => {
    console.error('Server closed. Exiting process.');
    process.exit(1);
  });
  
  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('⏱️  Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error('\n❌ ==========================================');
  console.error('❌ UNCAUGHT EXCEPTION DETECTED!');
  console.error('❌ ==========================================');
  console.error('Error:', err);
  
  if (err?.message) {
    console.error(`Message: ${err.message}`);
  }
  if (err?.stack) {
    console.error(`Stack:\n${err.stack}`);
  }
  
  logger.error('Uncaught Exception:', err);
  
  console.error('\n⚠️  Immediate shutdown required for uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

export { httpServer };
