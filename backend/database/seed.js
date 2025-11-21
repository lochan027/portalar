/**
 * Database Seed Script
 * 
 * Populates database with demo content for testing and expo presentations.
 * Creates two pre-configured markers:
 * - marker-news-001: News article with Perplexity-style summary
 * - marker-ad-001: Video advertisement with call-to-action
 * - marker-3d-001: 3D model showcase
 */

require('dotenv').config();
const database = require('./index');

const SEED_DATA = {
  content: [
    {
      markerId: 'marker-news-001',
      type: 'news',
      title: 'AI Revolutionizes Healthcare Diagnostics',
      summary: 'New artificial intelligence models can detect diseases up to 5 years earlier than traditional methods, with 95% accuracy in clinical trials.',
      url: 'https://example.com/ai-healthcare-breakthrough',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
      ctaText: 'Read Full Article',
      ctaUrl: 'https://example.com/ai-healthcare-breakthrough',
      style: {
        backgroundColor: '#1a1a2e',
        textColor: '#ffffff',
        accentColor: '#16c79a',
      },
    },
    {
      markerId: 'marker-ad-001',
      type: 'video',
      title: 'Introducing the New Product X',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      ctaText: 'Shop Now',
      ctaUrl: 'https://example.com/product-x',
      style: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        accentColor: '#ff6b6b',
      },
    },
    {
      markerId: 'marker-3d-001',
      type: '3d',
      title: '3D Product Visualization',
      summary: 'Interactive 3D model. Rotate and zoom with touch gestures.',
      modelUrl: '/assets/models/sample-product.glb',
      ctaText: 'View Details',
      ctaUrl: 'https://example.com/product-details',
      style: {
        backgroundColor: '#2c3e50',
        textColor: '#ecf0f1',
        accentColor: '#3498db',
      },
    },
    {
      markerId: 'demo-marker-001',
      type: 'news',
      title: 'Welcome to PortalAR!',
      summary: 'Point your camera at this marker to see dynamic AR content. This demo shows how printed QR codes can display real-time information.',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      ctaText: 'Learn More',
      ctaUrl: 'https://github.com/yourusername/portal-ar',
      style: {
        backgroundColor: '#667eea',
        textColor: '#ffffff',
        accentColor: '#f093fb',
      },
    },
  ],
  analytics: [
    // Sample analytics events (last 7 days)
    ...generateSampleAnalytics('marker-news-001', 145, 87, 12.5),
    ...generateSampleAnalytics('marker-ad-001', 203, 156, 8.3),
    ...generateSampleAnalytics('marker-3d-001', 98, 45, 15.7),
    ...generateSampleAnalytics('demo-marker-001', 67, 32, 9.2),
  ],
};

/**
 * Generate sample analytics events for testing
 */
function generateSampleAnalytics(markerId, scans, clicks, avgDuration) {
  const events = [];
  const now = new Date();

  // Generate scan events over last 7 days
  for (let i = 0; i < scans; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);

    events.push({
      markerId,
      eventType: 'scan',
      sessionId: `session-${i}-${Math.random().toString(36).substring(7)}`,
      timestamp: timestamp.toISOString(),
      userAgent: getUserAgent(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    });

    // Some scans have view duration
    if (Math.random() > 0.3) {
      const duration = avgDuration + (Math.random() - 0.5) * 10;
      events.push({
        markerId,
        eventType: 'viewDuration',
        sessionId: events[events.length - 1].sessionId,
        timestamp: new Date(timestamp.getTime() + duration * 1000).toISOString(),
        duration: Math.max(1, duration),
        userAgent: getUserAgent(),
        ipAddress: events[events.length - 1].ipAddress,
      });
    }
  }

  // Generate click events
  for (let i = 0; i < clicks; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);

    events.push({
      markerId,
      eventType: 'click',
      sessionId: `session-click-${i}`,
      timestamp: timestamp.toISOString(),
      userAgent: getUserAgent(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    });
  }

  return events;
}

/**
 * Get random user agent for realistic analytics
 */
function getUserAgent() {
  const agents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.87 Mobile Safari/537.36',
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Run seeding process
 */
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Initialize database
    await database.initialize();

    // Seed content
    console.log('📝 Seeding content...');
    for (const content of SEED_DATA.content) {
      await database.setContent(content.markerId, content);
      console.log(`   ✓ Created content for ${content.markerId}`);
    }

    // Seed analytics
    console.log('\n📊 Seeding analytics...');
    for (const event of SEED_DATA.analytics) {
      await database.recordAnalyticsEvent(event);
    }
    console.log(`   ✓ Created ${SEED_DATA.analytics.length} analytics events`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo markers available:');
    console.log('  - marker-news-001  (AI Healthcare News)');
    console.log('  - marker-ad-001    (Product Video Ad)');
    console.log('  - marker-3d-001    (3D Model Showcase)');
    console.log('  - demo-marker-001  (Welcome Message)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed, SEED_DATA };
