/**
 * Content Management Routes
 * 
 * Handles AR marker content CRUD operations.
 * Public endpoint for reading content (GET), protected endpoints for writing (POST/PUT/DELETE).
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const database = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/content/:markerId
 * Get AR content for a specific marker (PUBLIC)
 * Called by frontend when marker is detected
 */
router.get('/:markerId',
  [
    param('markerId').isString().trim().notEmpty().withMessage('Marker ID is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { markerId } = req.params;

    const content = await database.getContent(markerId);

    if (!content) {
      throw new AppError(`Content not found for marker: ${markerId}`, 404);
    }

    // Check if content is expired
    if (content.expiresAt && new Date(content.expiresAt) < new Date()) {
      throw new AppError('Content has expired', 410, {
        expiresAt: content.expiresAt,
      });
    }

    res.json({
      success: true,
      data: content,
    });
  })
);

/**
 * GET /api/content
 * List all marker content (ADMIN)
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const contentList = await database.listAllContent();

    res.json({
      success: true,
      count: contentList.length,
      data: contentList,
    });
  })
);

/**
 * POST /api/content/:markerId
 * Create or update content for a marker (ADMIN)
 */
router.post('/:markerId',
  authenticateToken,
  [
    param('markerId').isString().trim().notEmpty().withMessage('Marker ID is required'),
    body('type').isIn(['video', 'news', '3d', 'image']).withMessage('Invalid content type'),
    body('title').optional().isString().isLength({ max: 200 }),
    body('summary').optional().isString().isLength({ max: 500 }),
    body('url').optional().isURL(),
    body('videoUrl').optional().isURL(),
    body('posterUrl').optional().isURL(),
    body('modelUrl').optional().isURL(),
    body('imageUrl').optional().isURL(),
    body('ctaText').optional().isString().isLength({ max: 50 }),
    body('ctaUrl').optional().isURL(),
    body('expiresAt').optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { markerId } = req.params;
    const contentData = req.body;

    // Type-specific validation
    if (contentData.type === 'video' && !contentData.videoUrl) {
      throw new AppError('videoUrl is required for video content', 400);
    }

    if (contentData.type === '3d' && !contentData.modelUrl) {
      throw new AppError('modelUrl is required for 3D content', 400);
    }

    if (contentData.type === 'news' && !contentData.title) {
      throw new AppError('title is required for news content', 400);
    }

    const savedContent = await database.setContent(markerId, contentData);

    res.json({
      success: true,
      message: 'Content saved successfully',
      data: savedContent,
    });
  })
);

/**
 * PUT /api/content/:markerId
 * Update existing content (alias for POST for REST compliance)
 */
router.put('/:markerId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Check if content exists
    const existing = await database.getContent(req.params.markerId);
    if (!existing) {
      throw new AppError('Content not found', 404);
    }

    // Reuse POST logic
    req.url = req.url.replace('/put/', '/post/');
    return router.handle(req, res);
  })
);

/**
 * DELETE /api/content/:markerId
 * Delete marker content (ADMIN)
 */
router.delete('/:markerId',
  authenticateToken,
  [
    param('markerId').isString().trim().notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const { markerId } = req.params;

    const result = await database.deleteContent(markerId);

    if (!result.deleted) {
      throw new AppError('Content not found', 404);
    }

    res.json({
      success: true,
      message: `Content deleted for marker: ${markerId}`,
    });
  })
);

module.exports = router;
