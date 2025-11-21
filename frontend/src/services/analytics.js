/**
 * Analytics Service
 * 
 * Client-side analytics tracking for AR engagement metrics.
 * Tracks: scans, view duration, clicks, shares
 */

import { v4 as uuidv4 } from 'uuid';
import { recordEvent } from './api';

// Session storage
let currentSession = null;
let sessionStartTime = null;

/**
 * Start a new analytics session
 */
export function startSession(markerId) {
  const sessionId = uuidv4();
  currentSession = {
    sessionId,
    markerId,
    startTime: Date.now(),
  };
  sessionStartTime = Date.now();

  console.log('Analytics session started:', sessionId);
  return sessionId;
}

/**
 * End current session and send final analytics
 */
export function endSession(markerId, sessionId) {
  if (!currentSession) return;

  const duration = (Date.now() - sessionStartTime) / 1000;

  // Send final viewDuration event
  trackEvent({
    markerId,
    eventType: 'viewDuration',
    sessionId,
    duration,
  });

  currentSession = null;
  sessionStartTime = null;
  
  console.log('Analytics session ended');
}

/**
 * Track an analytics event
 */
export async function trackEvent(event) {
  try {
    await recordEvent({
      ...event,
      timestamp: new Date().toISOString(),
      metadata: {
        ...event.metadata,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        deviceType: getDeviceType(),
      },
    });

    console.log('Event tracked:', event.eventType);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track scan event (marker detected)
 */
export function trackScan(markerId, sessionId) {
  return trackEvent({
    markerId,
    eventType: 'scan',
    sessionId,
  });
}

/**
 * Track click event (user interacted with AR content)
 */
export function trackClick(markerId, sessionId, target) {
  return trackEvent({
    markerId,
    eventType: 'click',
    sessionId,
    metadata: {
      target,
    },
  });
}

/**
 * Track share event (user shared AR experience)
 */
export function trackShare(markerId, sessionId, method) {
  return trackEvent({
    markerId,
    eventType: 'share',
    sessionId,
    metadata: {
      method,
    },
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) {
    return /iPad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

export default {
  startSession,
  endSession,
  trackEvent,
  trackScan,
  trackClick,
  trackShare,
};
