/**
 * Perplexity AI Integration Routes
 * 
 * Provides AI-powered content summarization using Perplexity API.
 * Extracts key information from articles and generates AR-friendly summaries.
 * 
 * Security: ADMIN ONLY - Never expose API key to frontend
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const perplexityService = require('../services/perplexity');
const { authenticateToken } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/perplexity/summary
 * Generate summary from article URL or query (ADMIN)
 */
router.post('/summary',
  authenticateToken,
  [
    body('url').optional().isURL().withMessage('Invalid URL format'),
    body('query').optional().isString().isLength({ min: 3, max: 500 }),
    body('maxLength').optional().isInt({ min: 50, max: 1000 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { url, query, maxLength } = req.body;

    // Must provide either URL or query
    if (!url && !query) {
      throw new AppError('Either url or query must be provided', 400);
    }

    // Check if Perplexity is enabled
    if (process.env.ENABLE_PERPLEXITY === 'false') {
      throw new AppError('Perplexity integration is disabled', 503);
    }

    let summary;

    if (url) {
      // Summarize from URL
      summary = await perplexityService.summarizeArticle(url, maxLength || 200);
    } else {
      // Generate content from query
      summary = await perplexityService.generateContent(query, maxLength || 200);
    }

    res.json({
      success: true,
      data: summary,
    });
  })
);

/**
 * POST /api/perplexity/summarize-and-save
 * Generate summary and save directly to marker content (ADMIN)
 * Combines summarization + content update in one operation
 */
router.post('/summarize-and-save',
  authenticateToken,
  [
    body('markerId').isString().trim().notEmpty().withMessage('Marker ID is required'),
    body('url').isURL().withMessage('Valid article URL is required'),
    body('maxLength').optional().isInt({ min: 50, max: 1000 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { markerId, url, maxLength } = req.body;

    // Check if Perplexity is enabled
    if (process.env.ENABLE_PERPLEXITY === 'false') {
      throw new AppError('Perplexity integration is disabled', 503);
    }

    // Generate summary
    const summary = await perplexityService.summarizeArticle(url, maxLength || 200);

    // Save to database
    const database = require('../database');
    const content = await database.setContent(markerId, {
      type: 'news',
      title: summary.headline,
      summary: summary.summary,
      url: url,
      imageUrl: summary.imageUrl || null,
      style: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        accentColor: '#00ff88',
      },
    });

    res.json({
      success: true,
      message: 'Article summarized and saved',
      data: {
        markerId,
        summary,
        content,
      },
    });
  })
);

/**
 * POST /api/perplexity/extract-metadata
 * Extract metadata (title, description, image) from URL (ADMIN)
 * Useful for quick previews before full summarization
 */
router.post('/extract-metadata',
  authenticateToken,
  [
    body('url').isURL().withMessage('Valid URL is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { url } = req.body;

    const metadata = await perplexityService.extractMetadata(url);

    res.json({
      success: true,
      data: metadata,
    });
  })
);

/**
 * GET /api/perplexity/status
 * Check if Perplexity integration is configured (ADMIN)
 */
router.get('/status',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const isConfigured = !!process.env.PERPLEXITY_API_KEY;
    const isEnabled = process.env.ENABLE_PERPLEXITY !== 'false';
    const isMockMode = process.env.PERPLEXITY_MOCK_MODE === 'true';

    res.json({
      success: true,
      configured: isConfigured,
      enabled: isEnabled,
      mockMode: isMockMode,
      message: !isConfigured
        ? 'Perplexity API key not configured'
        : isMockMode
        ? 'Running in mock mode (set PERPLEXITY_MOCK_MODE=false to use real API)'
        : 'Perplexity integration active',
    });
  })
);

module.exports = router;
