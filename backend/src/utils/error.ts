/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a new application error
 */
export const createError = (message: string, statusCode: number = 500, details?: any): AppError => {
  return new AppError(message, statusCode, details);
};

/**
 * Common error types
 */
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST_ERROR: 'BAD_REQUEST_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  UNAUTHORIZED_ERROR: 'UNAUTHORIZED_ERROR',
} as const;

/**
 * Predefined error creators
 */
export const createValidationError = (message: string, details?: any): AppError => {
  return createError(message, 400, { ...details, type: ErrorTypes.VALIDATION_ERROR });
};

export const createAuthenticationError = (message: string = 'Authentication failed'): AppError => {
  return createError(message, 401, { type: ErrorTypes.AUTHENTICATION_ERROR });
};

export const createAuthorizationError = (message: string = 'Access denied'): AppError => {
  return createError(message, 403, { type: ErrorTypes.AUTHORIZATION_ERROR });
};

export const createNotFoundError = (message: string = 'Resource not found'): AppError => {
  return createError(message, 404, { type: ErrorTypes.NOT_FOUND_ERROR });
};

export const createConflictError = (message: string = 'Resource conflict'): AppError => {
  return createError(message, 409, { type: ErrorTypes.CONFLICT_ERROR });
};

export const createBadRequestError = (message: string = 'Bad request'): AppError => {
  return createError(message, 400, { type: ErrorTypes.BAD_REQUEST_ERROR });
};

export const createInternalServerError = (message: string = 'Internal server error'): AppError => {
  return createError(message, 500, { type: ErrorTypes.INTERNAL_SERVER_ERROR });
};

/**
 * Specific error classes for common HTTP errors
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, { ...details, type: ErrorTypes.BAD_REQUEST_ERROR });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, { type: ErrorTypes.UNAUTHORIZED_ERROR });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, { type: ErrorTypes.FORBIDDEN_ERROR });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404, { type: ErrorTypes.NOT_FOUND_ERROR });
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409, { type: ErrorTypes.CONFLICT_ERROR });
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, { type: ErrorTypes.INTERNAL_SERVER_ERROR });
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message: string = 'Payload too large') {
    super(message, 413, { type: 'PAYLOAD_TOO_LARGE' });
  }
}
