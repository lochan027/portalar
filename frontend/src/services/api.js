/**
 * API Service
 * 
 * Handles all backend API communication.
 * Supports both live API calls and demo/offline mode.
 */

import axios from 'axios';
import { DEMO_CONTENT } from '../data/demoContent';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Content API
// ============================================================================

/**
 * Fetch content for a specific marker
 */
export async function fetchContent(markerId) {
  // Demo mode: return embedded content
  if (DEMO_MODE) {
    const demoContent = DEMO_CONTENT[markerId];
    if (!demoContent) {
      throw new Error(`Demo content not found for marker: ${markerId}`);
    }
    return demoContent;
  }

  try {
    const response = await api.get(`/content/${markerId}`);
    return response.data.data;
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = error.response.data?.message || 'Failed to load content';
      
      if (status === 404) {
        throw new Error(`Content not found for marker: ${markerId}`);
      } else if (status === 410) {
        throw new Error('Content has expired');
      } else {
        throw new Error(message);
      }
    } else if (error.request) {
      // Network error
      console.warn('Network error, attempting demo mode fallback');
      
      // Fallback to demo content if available
      const demoContent = DEMO_CONTENT[markerId];
      if (demoContent) {
        console.log('Using demo content as fallback');
        return demoContent;
      }
      
      throw new Error('Network error: Unable to reach server');
    } else {
      throw new Error('Failed to load content');
    }
  }
}

/**
 * Get all content (admin only)
 */
export async function getAllContent(token) {
  const response = await api.get('/content', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

/**
 * Update content for a marker (admin only)
 */
export async function updateContent(markerId, content, token) {
  const response = await api.post(`/content/${markerId}`, content, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

/**
 * Delete content for a marker (admin only)
 */
export async function deleteContent(markerId, token) {
  const response = await api.delete(`/content/${markerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ============================================================================
// Analytics API
// ============================================================================

/**
 * Record an analytics event
 */
export async function recordEvent(event) {
  // In demo mode, just log to console
  if (DEMO_MODE) {
    console.log('Analytics event (demo mode):', event);
    return { success: true };
  }

  try {
    const response = await api.post('/analytics', event);
    return response.data;
  } catch (error) {
    console.error('Failed to record analytics:', error);
    // Don't throw - analytics failure shouldn't break app
    return { success: false };
  }
}

/**
 * Get analytics for a marker (admin only)
 */
export async function getAnalytics(markerId, options, token) {
  const response = await api.get(`/analytics/${markerId}`, {
    params: options,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

/**
 * Get analytics summary for a marker (admin only)
 */
export async function getAnalyticsSummary(markerId, token) {
  const response = await api.get(`/analytics/${markerId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

/**
 * Get all analytics summaries (admin only)
 */
export async function getAllAnalyticsSummaries(token) {
  const response = await api.get('/analytics', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

// ============================================================================
// Perplexity API (Admin only)
// ============================================================================

/**
 * Generate summary from URL
 */
export async function generateSummary(url, token) {
  const response = await api.post(
    '/perplexity/summary',
    { url },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

/**
 * Summarize and save directly to marker
 */
export async function summarizeAndSave(markerId, url, token) {
  const response = await api.post(
    '/perplexity/summarize-and-save',
    { markerId, url },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

// ============================================================================
// Auth API
// ============================================================================

/**
 * Admin login
 */
export async function login(password) {
  const response = await api.post('/auth/login', { password });
  return response.data;
}

/**
 * Verify token
 */
export async function verifyToken(token) {
  const response = await api.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export default api;
