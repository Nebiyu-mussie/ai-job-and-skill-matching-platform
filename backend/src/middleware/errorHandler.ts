import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging
  console.error('\n❌ ==========================================');
  console.error(`❌ ERROR: ${req.method} ${req.path}`);
  console.error('❌ ==========================================');
  console.error(`Message: ${err.message}`);
  console.error(`Status: ${err.statusCode || 500}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.error(`Request Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  if (err.stack) {
    console.error(`Stack Trace:\n${err.stack}`);
  }
  console.error('❌ ==========================================\n');

  logger.error(`${req.method} ${req.path} - ${err.message}`, {
    stack: err.stack,
    statusCode: err.statusCode,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    error = new ApiError(`Duplicate field value: ${field}`, 409);
    console.error(`🔑 MongoDB Duplicate Key Error on field: ${field}`);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    error = new ApiError('Validation failed', 400, messages);
    console.error(`✏️  Mongoose Validation Error: ${messages.join(', ')}`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(`Invalid ${err.path}: ${err.value}`, 400);
    console.error(`🆔 Invalid ObjectId: ${err.path} = ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('Invalid token', 401);
    console.error('🔐 JWT Error: Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError('Token expired', 401);
    console.error('⏱️  JWT Error: Token expired');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError('File size too large', 400);
    console.error('📁 Multer Error: File size exceeded');
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = new ApiError('Database connection error. Please try again later.', 503);
    console.error('🔌 MongoDB Connection Error:', err.message);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};
