import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';
import { initSocket } from './config/socket';
import { logger } from './utils/logger';
import { createServer } from 'http';
import { seedAdmin } from './utils/seeder';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    logger.info('✅ MongoDB connected successfully');

    await seedAdmin();

    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📖 API Docs: http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
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
