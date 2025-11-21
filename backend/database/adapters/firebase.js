/**
 * Firebase Firestore Database Adapter
 * 
 * Cloud-hosted database implementation using Google Firebase.
 * Great for production deployments with real-time sync capabilities.
 * 
 * Benefits:
 * - Real-time updates
 * - Auto-scaling
 * - Global distribution
 * - Built-in security rules
 * - Easy mobile integration
 * 
 * Setup:
 * 1. Create Firebase project at https://console.firebase.google.com/
 * 2. Generate service account key (Project Settings → Service Accounts)
 * 3. Set environment variables in .env
 */

const admin = require('firebase-admin');

let db;

/**
 * Initialize Firebase connection
 */
async function initialize() {
  try {
    // Initialize Firebase Admin SDK
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });

    db = admin.firestore();
    console.log('Firebase Firestore connected');
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    throw new Error('Firebase configuration missing or invalid. Check .env file.');
  }
}

/**
 * Close Firebase connection (graceful shutdown)
 */
async function close() {
  if (admin.apps.length > 0) {
    await admin.app().delete();
  }
}

// ============================================================================
// Content Operations
// ============================================================================

async function getContent(markerId) {
  const docRef = db.collection('content').doc(markerId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  return {
    markerId,
    ...doc.data(),
  };
}

async function setContent(markerId, content) {
  const docRef = db.collection('content').doc(markerId);
  
  const data = {
    ...content,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Add createdAt only for new documents
  const doc = await docRef.get();
  if (!doc.exists) {
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
  }

  await docRef.set(data, { merge: true });

  return {
    markerId,
    ...content,
  };
}

async function deleteContent(markerId) {
  const docRef = db.collection('content').doc(markerId);
  await docRef.delete();
  return { deleted: true };
}

async function listAllContent() {
  const snapshot = await db.collection('content')
    .orderBy('updatedAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    markerId: doc.id,
    ...doc.data(),
  }));
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

  const docRef = await db.collection('analytics').add({
    markerId,
    eventType,
    sessionId: sessionId || null,
    timestamp: timestamp ? admin.firestore.Timestamp.fromDate(new Date(timestamp)) : admin.firestore.FieldValue.serverTimestamp(),
    duration: duration || null,
    userAgent: userAgent || null,
    ipAddress: ipAddress || null,
    metadata: metadata || null,
  });

  return {
    id: docRef.id,
    ...event,
  };
}

async function getAnalytics(markerId, options = {}) {
  const { startDate, endDate, eventType, limit = 1000 } = options;

  let query = db.collection('analytics').where('markerId', '==', markerId);

  if (startDate) {
    query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate)));
  }

  if (endDate) {
    query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate)));
  }

  if (eventType) {
    query = query.where('eventType', '==', eventType);
  }

  query = query.orderBy('timestamp', 'desc').limit(limit);

  const snapshot = await query.get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate().toISOString(),
  }));
}

async function getAnalyticsSummary(markerId) {
  const snapshot = await db.collection('analytics')
    .where('markerId', '==', markerId)
    .get();

  let totalScans = 0;
  let totalClicks = 0;
  let totalDuration = 0;
  let durationCount = 0;
  let lastScan = null;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    
    if (data.eventType === 'scan') {
      totalScans++;
      const scanTime = data.timestamp?.toDate();
      if (!lastScan || scanTime > lastScan) {
        lastScan = scanTime;
      }
    } else if (data.eventType === 'click') {
      totalClicks++;
    } else if (data.eventType === 'viewDuration' && data.duration) {
      totalDuration += data.duration;
      durationCount++;
    }
  });

  return {
    markerId,
    totalScans,
    totalClicks,
    avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
    lastScan: lastScan?.toISOString() || null,
  };
}

async function getAllAnalyticsSummaries() {
  const snapshot = await db.collection('analytics').get();

  const summaries = {};

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const { markerId, eventType, duration, timestamp } = data;

    if (!summaries[markerId]) {
      summaries[markerId] = {
        markerId,
        totalScans: 0,
        totalClicks: 0,
        totalDuration: 0,
        durationCount: 0,
        lastScan: null,
      };
    }

    const summary = summaries[markerId];

    if (eventType === 'scan') {
      summary.totalScans++;
      const scanTime = timestamp?.toDate();
      if (!summary.lastScan || scanTime > summary.lastScan) {
        summary.lastScan = scanTime;
      }
    } else if (eventType === 'click') {
      summary.totalClicks++;
    } else if (eventType === 'viewDuration' && duration) {
      summary.totalDuration += duration;
      summary.durationCount++;
    }
  });

  return Object.values(summaries).map(s => ({
    markerId: s.markerId,
    totalScans: s.totalScans,
    totalClicks: s.totalClicks,
    avgDuration: s.durationCount > 0 ? s.totalDuration / s.durationCount : 0,
    lastScan: s.lastScan?.toISOString() || null,
  })).sort((a, b) => b.totalScans - a.totalScans);
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
