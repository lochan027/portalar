/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in route handlers and middleware,
 * formats them consistently, and returns appropriate HTTP responses.
 * 
 * Error types:
 * - Validation errors (400)
 * - Authentication errors (401)
 * - Authorization errors (403)
 * - Not found errors (404)
 * - Server errors (500)
 */

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguish from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Log error for debugging (in production, send to logging service)
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    console.error('❌ Server Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    // In production, hide internal error details from client
    message = 'An unexpected error occurred';
    details = null;
  } else {
    console.error('❌ Error:', err);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.errors || err.details;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
    // Database constraint violation
    statusCode = 409;
    message = 'Resource conflict (duplicate entry)';
  }

  // Send error response
  res.status(statusCode).json({
    error: getErrorName(statusCode),
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Get human-readable error name from status code
 */
function getErrorName(statusCode) {
  const errorNames = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return errorNames[statusCode] || 'Error';
}

/**
 * Async error wrapper for route handlers
 * Eliminates need for try-catch in every async route
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = errorHandler;
module.exports.AppError = AppError;
module.exports.asyncHandler = asyncHandler;
