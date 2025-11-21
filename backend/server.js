/**
 * PortalAR Backend Server
 * 
 * Production-ready Express API server for WebAR marker-based content delivery.
 * Handles dynamic content management, analytics tracking, and Perplexity AI integration.
 * 
 * Architecture:
 * - RESTful API with Express.js
 * - Multiple database adapters (SQLite, Firebase, PostgreSQL)
 * - JWT-based admin authentication
 * - Rate limiting and security middleware
 * - CORS configuration for WebAR client access
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Import routes
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');
const perplexityRoutes = require('./routes/perplexity');
const authRoutes = require('./routes/auth');

// Import middleware
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { validateOrigin } = require('./middleware/cors');

// Import database
const database = require('./database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================================
// Middleware Configuration
// ============================================================================

// Security headers (Helmet)
if (process.env.ENABLE_HELMET !== 'false') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow cross-origin AR assets
  }));
}

// Compression
if (process.env.ENABLE_COMPRESSION !== 'false') {
  app.use(compression());
}

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (Morgan)
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Rate limiting (apply to all routes)
app.use(rateLimiter);

// ============================================================================
// Database Initialization
// ============================================================================

/**
 * Initialize database connection on startup
 * Supports SQLite, Firebase, and PostgreSQL based on DATABASE_TYPE env var
 */
database.initialize()
  .then(() => {
    console.log(`✅ Database initialized (${process.env.DATABASE_TYPE || 'sqlite'})`);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });

// ============================================================================
// API Routes
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_TYPE || 'sqlite',
  });
});

// API version info
app.get('/api', (req, res) => {
  res.json({
    name: 'PortalAR API',
    version: '1.0.0',
    endpoints: {
      content: '/api/content/:markerId',
      analytics: '/api/analytics',
      perplexity: '/api/perplexity/summary',
      auth: '/api/auth/login',
      health: '/health',
    },
    documentation: 'https://github.com/yourusername/portal-ar',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/perplexity', perplexityRoutes);

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableRoutes: [
      'GET /health',
      'GET /api',
      'GET /api/content/:markerId',
      'POST /api/content/:markerId',
      'POST /api/analytics',
      'GET /api/analytics/:markerId',
      'POST /api/perplexity/summary',
      'POST /api/auth/login',
    ],
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

const server = app.listen(PORT, HOST, () => {
  console.log('\n🚀 PortalAR Backend Server');
  console.log('================================');
  console.log(`📡 Server running at: http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DATABASE_TYPE || 'sqlite'}`);
  console.log(`🔐 Admin auth: ${process.env.ADMIN_JWT_SECRET ? 'Configured' : '⚠️  Not configured'}`);
  console.log(`🤖 Perplexity: ${process.env.PERPLEXITY_API_KEY ? 'Configured' : 'Mock mode'}`);
  console.log(`✅ CORS origins: ${allowedOrigins.join(', ')}`);
  console.log('================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    database.close()
      .then(() => {
        console.log('✅ Database connections closed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error closing database:', error);
        process.exit(1);
      });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
