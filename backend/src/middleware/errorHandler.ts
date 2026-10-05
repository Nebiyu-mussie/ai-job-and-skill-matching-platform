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

  logger.error(`${req.method} ${req.path} - ${err.message}`, {
    stack: err.stack,
    statusCode: err.statusCode,
  });

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    error = new ApiError(`Duplicate field value: ${field}`, 409);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    error = new ApiError('Validation failed', 400, messages);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError('Token expired', 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError('File size too large', 400);
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
