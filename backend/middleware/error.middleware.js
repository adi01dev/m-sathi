
/**
 * Global error handling middleware
 */
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.AppError = AppError;

/**
 * Async handler wrapper to avoid try-catch blocks in route handlers
 */
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
