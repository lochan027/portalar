/**
 * Demo Content Data
 * 
 * Embedded content for offline/demo mode.
 * Used when REACT_APP_DEMO_MODE=true or backend unavailable.
 */

export const DEMO_CONTENT = {
  'marker-news-001': {
    markerId: 'marker-news-001',
    type: 'news',
    title: 'AI Revolutionizes Healthcare Diagnostics',
    summary: 'New artificial intelligence models can detect diseases up to 5 years earlier than traditional methods, with 95% accuracy in clinical trials.',
    url: 'https://example.com/ai-healthcare-breakthrough',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format',
    ctaText: 'Read Full Article',
    ctaUrl: 'https://example.com/ai-healthcare-breakthrough',
    style: {
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      accentColor: '#16c79a',
    },
  },

  'marker-ad-001': {
    markerId: 'marker-ad-001',
    type: 'video',
    title: 'Introducing the New Product X',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format',
    ctaText: 'Shop Now',
    ctaUrl: 'https://example.com/product-x',
    style: {
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ff6b6b',
    },
  },

  'marker-3d-001': {
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

  'demo-marker-001': {
    markerId: 'demo-marker-001',
    type: 'news',
    title: 'Welcome to PortalAR!',
    summary: 'Point your camera at this marker to see dynamic AR content. This demo shows how printed QR codes can display real-time information.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format',
    ctaText: 'Learn More',
    ctaUrl: 'https://github.com/yourusername/portal-ar',
    style: {
      backgroundColor: '#667eea',
      textColor: '#ffffff',
      accentColor: '#f093fb',
    },
  },
};

export default DEMO_CONTENT;
