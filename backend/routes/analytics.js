/**
 * Analytics Routes
 * 
 * Handles collection and retrieval of AR engagement analytics.
 * Public endpoint for recording events, protected endpoints for viewing analytics.
 */

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const database = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { analyticsLimiter } = require('../middleware/rateLimiter');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/analytics
 * Record an analytics event (PUBLIC)
 * Called by frontend when user interacts with AR content
 */
router.post('/',
  analyticsLimiter,
  [
    body('markerId').isString().trim().notEmpty().withMessage('Marker ID is required'),
    body('eventType').isIn(['scan', 'viewDuration', 'click', 'share']).withMessage('Invalid event type'),
    body('sessionId').optional().isUUID(),
    body('timestamp').optional().isISO8601(),
    body('duration').optional().isFloat({ min: 0 }),
    body('metadata').optional().isObject(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const {
      markerId,
      eventType,
      sessionId,
      timestamp,
      duration,
      metadata,
    } = req.body;

    // Capture request metadata
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const event = {
      markerId,
      eventType,
      sessionId,
      timestamp,
      duration,
      userAgent,
      ipAddress,
      metadata,
    };

    const savedEvent = await database.recordAnalyticsEvent(event);

    res.json({
      success: true,
      message: 'Event recorded',
      eventId: savedEvent.id,
    });
  })
);

/**
 * GET /api/analytics/:markerId
 * Get analytics for a specific marker (ADMIN)
 */
router.get('/:markerId',
  authenticateToken,
  [
    param('markerId').isString().trim().notEmpty(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('eventType').optional().isIn(['scan', 'viewDuration', 'click', 'share']),
    query('limit').optional().isInt({ min: 1, max: 10000 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { markerId } = req.params;
    const { startDate, endDate, eventType, limit } = req.query;

    const events = await database.getAnalytics(markerId, {
      startDate,
      endDate,
      eventType,
      limit: limit || 1000,
    });

    res.json({
      success: true,
      markerId,
      count: events.length,
      filters: {
        startDate,
        endDate,
        eventType,
      },
      data: events,
    });
  })
);

/**
 * GET /api/analytics/:markerId/summary
 * Get aggregated analytics summary for a marker (ADMIN)
 */
router.get('/:markerId/summary',
  authenticateToken,
  [
    param('markerId').isString().trim().notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const { markerId } = req.params;

    const summary = await database.getAnalyticsSummary(markerId);

    res.json({
      success: true,
      data: summary,
    });
  })
);

/**
 * GET /api/analytics
 * Get analytics summary for all markers (ADMIN)
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const summaries = await database.getAllAnalyticsSummaries();

    res.json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  })
);

/**
 * POST /api/analytics/batch
 * Record multiple analytics events at once (PUBLIC)
 * Useful for offline-first applications that queue events
 */
router.post('/batch',
  analyticsLimiter,
  [
    body('events').isArray({ min: 1, max: 100 }).withMessage('Events must be an array (1-100 items)'),
    body('events.*.markerId').isString().trim().notEmpty(),
    body('events.*.eventType').isIn(['scan', 'viewDuration', 'click', 'share']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { events } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Record all events
    const savedEvents = await Promise.all(
      events.map(event =>
        database.recordAnalyticsEvent({
          ...event,
          userAgent,
          ipAddress,
        })
      )
    );

    res.json({
      success: true,
      message: `${savedEvents.length} events recorded`,
      count: savedEvents.length,
    });
  })
);

module.exports = router;
