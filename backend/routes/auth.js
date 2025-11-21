/**
 * Authentication Routes
 * 
 * Handles admin login and JWT token generation.
 * Simple password-based auth for MVP; recommend OAuth for production.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate admin and return JWT token
 */
router.post('/login',
  authLimiter,
  [
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { password } = req.body;

    // Verify password against hashed password in env
    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!storedHash) {
      throw new AppError('Admin authentication not configured', 500);
    }

    const isValid = await bcrypt.compare(password, storedHash);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: 'admin',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      }
    );

    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      user: {
        username: 'admin',
        role: 'admin',
      },
    });
  })
);

/**
 * GET /api/auth/verify
 * Verify if current token is valid
 */
router.get('/verify',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      res.json({
        valid: true,
        user: {
          username: decoded.username,
          role: decoded.role,
        },
      });
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  })
);

module.exports = router;
