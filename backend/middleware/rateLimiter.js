/**
 * Rate Limiting Middleware
 * 
 * Protects the API from abuse by limiting the number of requests
 * from a single IP address within a time window.
 * 
 * Configuration:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 15 minutes)
 * - RATE_LIMIT_MAX_REQUESTS: Maximum requests per window (default: 100)
 */

const rateLimit = require('express-rate-limit');

// Standard rate limiter for general API routes
const standardLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: 'Check the Retry-After header',
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${req.rateLimit.limit} requests per ${req.rateLimit.windowMs / 1000}s.`,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// Strict rate limiter for admin/auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    error: 'Too Many Authentication Attempts',
    message: 'Too many login attempts. Please try again later.',
  },
});

// Analytics rate limiter (higher limit for frequent events)
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 events per minute per IP
  message: {
    error: 'Analytics Rate Limit Exceeded',
    message: 'Too many analytics events. Please slow down.',
  },
});

module.exports = standardLimiter;
module.exports.authLimiter = authLimiter;
module.exports.analyticsLimiter = analyticsLimiter;
