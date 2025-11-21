/**
 * SQLite Database Adapter
 * 
 * Default database implementation using SQLite for simplicity.
 * Perfect for development, demos, and small-to-medium deployments.
 * 
 * Benefits:
 * - Zero configuration
 * - Serverless (no external DB required)
 * - Fast for single-server deployments
 * - Easy backup (single file)
 * 
 * Limitations:
 * - Not ideal for horizontal scaling
 * - No built-in replication
 * - Write concurrency limited
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db;

/**
 * Initialize SQLite database and create tables
 */
async function initialize() {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'database', 'portalAR.db');
  
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`SQLite database connected: ${dbPath}`);
        createTables()
          .then(resolve)
          .catch(reject);
      }
    });
  });
}

/**
 * Create database tables if they don't exist
 */
async function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Content table
      db.run(`
        CREATE TABLE IF NOT EXISTS content (
          marker_id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT,
          summary TEXT,
          url TEXT,
          video_url TEXT,
          poster_url TEXT,
          model_url TEXT,
          image_url TEXT,
          cta_text TEXT,
          cta_url TEXT,
          style TEXT,
          expires_at TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating content table:', err);
      });

      // Analytics table
      db.run(`
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          marker_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          session_id TEXT,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          duration REAL,
          user_agent TEXT,
          ip_address TEXT,
          metadata TEXT
        )
      `, (err) => {
        if (err) console.error('Error creating analytics table:', err);
      });

      // Create indexes for better query performance
      db.run('CREATE INDEX IF NOT EXISTS idx_analytics_marker ON analytics(marker_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp)');
      db.run('CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Close database connection
 */
async function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}

// ============================================================================
// Content Operations
// ============================================================================

async function getContent(markerId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM content WHERE marker_id = ?', [markerId], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        resolve(parseContentRow(row));
      }
    });
  });
}

async function setContent(markerId, content) {
  const {
    type,
    title,
    summary,
    url,
    videoUrl,
    posterUrl,
    modelUrl,
    imageUrl,
    ctaText,
    ctaUrl,
    style,
    expiresAt,
  } = content;

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO content (
        marker_id, type, title, summary, url, video_url, poster_url,
        model_url, image_url, cta_text, cta_url, style, expires_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(marker_id) DO UPDATE SET
        type = excluded.type,
        title = excluded.title,
        summary = excluded.summary,
        url = excluded.url,
        video_url = excluded.video_url,
        poster_url = excluded.poster_url,
        model_url = excluded.model_url,
        image_url = excluded.image_url,
        cta_text = excluded.cta_text,
        cta_url = excluded.cta_url,
        style = excluded.style,
        expires_at = excluded.expires_at,
        updated_at = CURRENT_TIMESTAMP
    `;

    db.run(sql, [
      markerId,
      type,
      title || null,
      summary || null,
      url || null,
      videoUrl || null,
      posterUrl || null,
      modelUrl || null,
      imageUrl || null,
      ctaText || null,
      ctaUrl || null,
      style ? JSON.stringify(style) : null,
      expiresAt || null,
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ markerId, ...content });
      }
    });
  });
}

async function deleteContent(markerId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM content WHERE marker_id = ?', [markerId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ deleted: this.changes > 0 });
      }
    });
  });
}

async function listAllContent() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM content ORDER BY updated_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(parseContentRow));
      }
    });
  });
}

// ============================================================================
// Analytics Operations
// ============================================================================

async function recordAnalyticsEvent(event) {
  const {
    markerId,
    eventType,
    sessionId,
    timestamp,
    duration,
    userAgent,
    ipAddress,
    metadata,
  } = event;

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO analytics (
        marker_id, event_type, session_id, timestamp, duration,
        user_agent, ip_address, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      markerId,
      eventType,
      sessionId || null,
      timestamp || new Date().toISOString(),
      duration || null,
      userAgent || null,
      ipAddress || null,
      metadata ? JSON.stringify(metadata) : null,
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, ...event });
      }
    });
  });
}

async function getAnalytics(markerId, options = {}) {
  const { startDate, endDate, eventType, limit = 1000 } = options;

  let sql = 'SELECT * FROM analytics WHERE marker_id = ?';
  const params = [markerId];

  if (startDate) {
    sql += ' AND timestamp >= ?';
    params.push(startDate);
  }

  if (endDate) {
    sql += ' AND timestamp <= ?';
    params.push(endDate);
  }

  if (eventType) {
    sql += ' AND event_type = ?';
    params.push(eventType);
  }

  sql += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(parseAnalyticsRow));
      }
    });
  });
}

async function getAnalyticsSummary(markerId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        marker_id,
        COUNT(CASE WHEN event_type = 'scan' THEN 1 END) as total_scans,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
        AVG(CASE WHEN event_type = 'viewDuration' THEN duration END) as avg_duration,
        MAX(timestamp) as last_scan
      FROM analytics
      WHERE marker_id = ?
      GROUP BY marker_id
    `;

    db.get(sql, [markerId], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row || !row.total_scans) {
        resolve({
          markerId,
          totalScans: 0,
          totalClicks: 0,
          avgDuration: 0,
          lastScan: null,
        });
      } else {
        resolve({
          markerId: row.marker_id,
          totalScans: row.total_scans || 0,
          totalClicks: row.total_clicks || 0,
          avgDuration: row.avg_duration || 0,
          lastScan: row.last_scan,
        });
      }
    });
  });
}

async function getAllAnalyticsSummaries() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        marker_id,
        COUNT(CASE WHEN event_type = 'scan' THEN 1 END) as total_scans,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
        AVG(CASE WHEN event_type = 'viewDuration' THEN duration END) as avg_duration,
        MAX(timestamp) as last_scan
      FROM analytics
      GROUP BY marker_id
      ORDER BY total_scans DESC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({
          markerId: row.marker_id,
          totalScans: row.total_scans || 0,
          totalClicks: row.total_clicks || 0,
          avgDuration: row.avg_duration || 0,
          lastScan: row.last_scan,
        })));
      }
    });
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseContentRow(row) {
  return {
    markerId: row.marker_id,
    type: row.type,
    title: row.title,
    summary: row.summary,
    url: row.url,
    videoUrl: row.video_url,
    posterUrl: row.poster_url,
    modelUrl: row.model_url,
    imageUrl: row.image_url,
    ctaText: row.cta_text,
    ctaUrl: row.cta_url,
    style: row.style ? JSON.parse(row.style) : null,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseAnalyticsRow(row) {
  return {
    id: row.id,
    markerId: row.marker_id,
    eventType: row.event_type,
    sessionId: row.session_id,
    timestamp: row.timestamp,
    duration: row.duration,
    userAgent: row.user_agent,
    ipAddress: row.ip_address,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  initialize,
  close,
  getContent,
  setContent,
  deleteContent,
  listAllContent,
  recordAnalyticsEvent,
  getAnalytics,
  getAnalyticsSummary,
  getAllAnalyticsSummaries,
};
