/**
 * JWT Authentication Middleware
 * 
 * Verifies JWT tokens for protected admin routes.
 * Extracts user information from token and attaches to req.user
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

/**
 * Verify JWT token and authenticate request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return next(new AppError('Authentication token required', 401));
  }

  jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token expired', 401));
      }
      return next(new AppError('Invalid token', 403));
    }

    req.user = user;
    next();
  });
};

/**
 * Optional authentication (doesn't fail if no token)
 * Useful for endpoints that have different behavior for authenticated users
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, user) => {
    req.user = err ? null : user;
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
