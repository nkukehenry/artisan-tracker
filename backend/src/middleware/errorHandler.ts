import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500): CustomError => {
  return new CustomError(message, statusCode);
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message } = error;

  // Log error details
  const errorDetails = {
    message: error.message,
    statusCode,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  };

  // Log based on error severity
  if (statusCode >= 500) {
    logger.error('Server Error', errorDetails);
  } else if (statusCode >= 400) {
    logger.warn('Client Error', errorDetails);
  } else {
    logger.info('Error', errorDetails);
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response: any = {
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  if (isDevelopment) {
    response.error.stack = error.stack;
    response.error.details = errorDetails;
  }

  res.status(statusCode).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Validation error handler
export const validationErrorHandler = (errors: any[]) => {
  const message = errors.map(error => error.msg).join(', ');
  return createError(message, 400);
};

// Database error handler
export const handleDatabaseError = (error: any): CustomError => {
  if (error.code === 'P2002') {
    return createError('Duplicate entry. This record already exists.', 409);
  }
  if (error.code === 'P2025') {
    return createError('Record not found.', 404);
  }
  if (error.code === 'P2003') {
    return createError('Foreign key constraint failed.', 400);
  }
  if (error.code === 'P2014') {
    return createError('Invalid ID provided.', 400);
  }
  
  logger.error('Unhandled database error', error);
  return createError('Database operation failed.', 500);
};

// Rate limit error handler
export const rateLimitErrorHandler = (req: Request, res: Response) => {
  const error = createError('Too many requests, please try again later.', 429);
  errorHandler(error, req, res, () => {});
};

export default errorHandler;
