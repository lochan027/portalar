/**
 * Landing Page Component
 * 
 * First page users see - provides instructions and demo links.
 * In production, users would scan physical QR codes, not visit this page directly.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const demoMarkers = [
    { id: 'marker-news-001', name: 'AI Healthcare News', emoji: '📰' },
    { id: 'marker-ad-001', name: 'Product Video Ad', emoji: '🎥' },
    { id: 'marker-3d-001', name: '3D Model Demo', emoji: '🎨' },
    { id: 'demo-marker-001', name: 'Welcome Message', emoji: '👋' },
  ];

  return (
    <div className="landing-page">
      <h1>🚀 PortalAR</h1>
      <p>
        Dynamic AR experiences anchored to printed QR codes.
        Point your camera at a QR marker to see interactive content come to life!
      </p>

      <div className="instructions">
        <h3 style={{ marginBottom: '1rem' }}>How It Works</h3>
        <ol>
          <li>Scan a QR code with your device camera</li>
          <li>Allow camera access when prompted</li>
          <li>Point camera at the printed marker</li>
          <li>Watch AR content appear!</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Demo Markers (Testing Only)</h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>
          In production, users scan physical QR codes. For testing:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          {demoMarkers.map(marker => (
            <button
              key={marker.id}
              className="button"
              onClick={() => navigate(`/scan/${marker.id}`)}
              style={{ padding: '12px 24px' }}
            >
              {marker.emoji} {marker.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '3rem', fontSize: '0.9rem', opacity: 0.7 }}>
        <a
          href="https://github.com/yourusername/portal-ar"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white', textDecoration: 'underline' }}
        >
          View Documentation & Source Code
        </a>
      </div>
    </div>
  );
}

export default LandingPage;
