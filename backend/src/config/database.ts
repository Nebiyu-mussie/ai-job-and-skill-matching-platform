import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  const options = {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected');
  });

  await mongoose.connect(mongoURI, options);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
