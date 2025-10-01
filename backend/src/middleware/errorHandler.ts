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
  error: AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if it's a Prisma error and convert it
  if (error.code && error.code.startsWith('P')) {
    error = handleDatabaseError(error);
  }

  let { statusCode = 500, message } = error;

  // Log full error details (only server-side)
  const errorDetails = {
    message: error.message,
    name: error.name,
    code: error.code,
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

  // Handle specific error types and sanitize messages
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed. Please check your input.';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format provided.';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload failed. Please check file size and format.';
  } else if (error.name === 'PrismaClientKnownRequestError') {
    error = handleDatabaseError(error);
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided.';
  } else if (error.name === 'PrismaClientInitializationError') {
    statusCode = 503;
    message = 'Database connection failed. Please try again later.';
  }

  // Sanitize message to prevent leaking internal details
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In production, never expose raw error messages that might contain file paths or internal details
  if (!isDevelopment && statusCode >= 500) {
    message = 'An internal server error occurred. Please try again later.';
  }

  // Remove any file paths or internal details from message
  if (!isDevelopment) {
    message = message.replace(/\/[^\s]+/g, '[path]'); // Remove file paths
    message = message.replace(/at .+\(.+\)/g, ''); // Remove stack trace snippets
    message = message.split('\n')[0]; // Take only first line
  }

  const response: any = {
    error: {
      message: message.trim(),
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  // Only add stack trace and details in development
  if (isDevelopment) {
    response.error.stack = error.stack;
    response.error.name = error.name;
    response.error.originalMessage = error.message;
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
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  if (error.code === 'P2002') {
    return createError('This record already exists. Please use a different value.', 409);
  }
  if (error.code === 'P2025') {
    return createError('The requested record was not found.', 404);
  }
  if (error.code === 'P2003') {
    return createError('Related record not found. Please check your input.', 400);
  }
  if (error.code === 'P2014') {
    return createError('Invalid ID format provided.', 400);
  }
  if (error.code === 'P1001') {
    return createError('Unable to connect to the database.', 503);
  }
  if (error.code === 'P1008') {
    return createError('Database operation timed out.', 408);
  }
  if (error.code === 'P1017') {
    return createError('Database connection was closed.', 503);
  }
  if (error.code === 'P2000') {
    return createError('Input value is too long.', 400);
  }
  if (error.code === 'P2001') {
    return createError('The record does not exist.', 404);
  }
  if (error.code === 'P2015') {
    return createError('Related record not found.', 404);
  }
  if (error.code === 'P2019') {
    return createError('Invalid input data.', 400);
  }
  
  logger.error('Unhandled database error', { code: error.code, message: error.message });
  return createError('A database error occurred. Please try again.', 500);
};

// Rate limit error handler
export const rateLimitErrorHandler = (req: Request, res: Response) => {
  const error = createError('Too many requests, please try again later.', 429);
  errorHandler(error, req, res, () => {});
};

export default errorHandler;
