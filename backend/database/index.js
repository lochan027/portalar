/**
 * Database Abstraction Layer
 * 
 * Provides a unified interface for different database backends:
 * - SQLite (default, no external dependencies)
 * - Firebase Firestore (cloud-hosted, real-time)
 * - PostgreSQL (production-grade SQL)
 * 
 * The adapter pattern allows switching databases via DATABASE_TYPE env var
 * without changing application code.
 */

const sqliteAdapter = require('./adapters/sqlite');
const firebaseAdapter = require('./adapters/firebase');
const postgresAdapter = require('./adapters/postgres');

let currentAdapter;

/**
 * Initialize database connection based on DATABASE_TYPE
 */
async function initialize() {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';

  switch (dbType) {
    case 'firebase':
      currentAdapter = firebaseAdapter;
      break;
    case 'postgres':
      currentAdapter = postgresAdapter;
      break;
    case 'sqlite':
    default:
      currentAdapter = sqliteAdapter;
      break;
  }

  await currentAdapter.initialize();
  console.log(`Database adapter loaded: ${dbType}`);
}

/**
 * Close database connections
 */
async function close() {
  if (currentAdapter && currentAdapter.close) {
    await currentAdapter.close();
  }
}

// ============================================================================
// Content Management
// ============================================================================

async function getContent(markerId) {
  return currentAdapter.getContent(markerId);
}

async function setContent(markerId, content) {
  return currentAdapter.setContent(markerId, content);
}

async function deleteContent(markerId) {
  return currentAdapter.deleteContent(markerId);
}

async function listAllContent() {
  return currentAdapter.listAllContent();
}

// ============================================================================
// Analytics
// ============================================================================

async function recordAnalyticsEvent(event) {
  return currentAdapter.recordAnalyticsEvent(event);
}

async function getAnalytics(markerId, options = {}) {
  return currentAdapter.getAnalytics(markerId, options);
}

async function getAnalyticsSummary(markerId) {
  return currentAdapter.getAnalyticsSummary(markerId);
}

async function getAllAnalyticsSummaries() {
  return currentAdapter.getAllAnalyticsSummaries();
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  initialize,
  close,
  // Content
  getContent,
  setContent,
  deleteContent,
  listAllContent,
  // Analytics
  recordAnalyticsEvent,
  getAnalytics,
  getAnalyticsSummary,
  getAllAnalyticsSummaries,
};
