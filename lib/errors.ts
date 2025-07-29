// Base error class for all application errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  keyValue?: any;
  errors?: any[];

  constructor(message: string, statusCode: number, isOperational = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = 'Please authenticate') {
    super(message, 401);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: Insufficient permissions') {
    super(message, 403);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message = 'Conflict occurred') {
    super(message, 409);
  }
}

// 422 Unprocessable Entity
export class ValidationError extends AppError {
  errors: any[];

  constructor(errors: any[] = [], message = 'Validation failed') {
    super(message, 422);
    this.errors = errors;
  }
}

// 429 Too Many Requests
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, false);
  }
}

// Type guard for MongoDB duplicate key error
export const isMongoDuplicateKeyError = (error: any): boolean => {
  return error.code === 11000 || error.code === 11001;
};

// Type guard for MongoDB validation error
export const isMongoValidationError = (error: any): boolean => {
  return error.name === 'ValidationError' || error.name === 'ValidatorError';
};

// Type guard for JWT errors
export const isJwtError = (error: any): boolean => {
  return error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError';
};

// Convert error to standard format for API responses
export const formatError = (error: any) => {
  // Handle known error types
  if (error instanceof AppError) {
    return {
      status: 'error',
      statusCode: error.statusCode,
      message: error.message,
      ...(error.errors && { errors: error.errors }),
      ...(error.code && { code: error.code }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  // Handle MongoDB duplicate key errors
  if (isMongoDuplicateKeyError(error)) {
    const field = Object.keys(error.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    return {
      status: 'error',
      statusCode: 400,
      message,
      field,
      value: error.keyValue[field]
    };
  }

  // Handle MongoDB validation errors
  if (isMongoValidationError(error)) {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    return {
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors
    };
  }

  // Handle JWT errors
  if (isJwtError(error)) {
    return {
      status: 'error',
      statusCode: 401,
      message: 'Invalid or expired token. Please log in again.'
    };
  }

  // Default error response
  return {
    status: 'error',
    statusCode: error.statusCode || 500,
    message: error.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};
