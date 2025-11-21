/**
 * Offline Fallback Component
 * 
 * Displayed when:
 * - WebAR not supported on device
 * - Backend API unavailable
 * - Marker content failed to load
 * - Camera permission denied
 * 
 * Provides graceful degradation with:
 * - Error explanation
 * - Direct link to content (if available)
 * - Troubleshooting tips
 */

import React from 'react';

function OfflineFallback({ markerId, content, error, onBack }) {
  function getErrorMessage() {
    if (error) {
      if (error.includes('camera') || error.includes('permission')) {
        return {
          title: '📷 Camera Access Required',
          message: 'Please allow camera access to experience AR. Check your browser settings and reload the page.',
          tips: [
            'On iOS: Settings → Safari → Camera → Allow',
            'On Android: Settings → Apps → Chrome → Permissions → Camera',
            'Ensure you\'re using HTTPS or localhost',
          ],
        };
      }

      if (error.includes('not supported') || error.includes('WebAR')) {
        return {
          title: '❌ WebAR Not Supported',
          message: 'Your device or browser doesn\'t support WebAR. Try using a newer device or update your browser.',
          tips: [
            'iOS: Safari 11.3+ required',
            'Android: Chrome 81+ required',
            'Desktop browsers have limited AR support',
          ],
        };
      }

      if (error.includes('404') || error.includes('not found')) {
        return {
          title: '🔍 Content Not Found',
          message: `No content configured for marker "${markerId}". Contact the campaign administrator.`,
          tips: [],
        };
      }

      return {
        title: '⚠️ Error Loading AR',
        message: error,
        tips: [
          'Check your internet connection',
          'Try reloading the page',
          'Ensure the marker ID is correct',
        ],
      };
    }

    return {
      title: '⚠️ Unable to Load AR',
      message: 'Something went wrong. Please try again.',
      tips: [],
    };
  }

  const { title, message, tips } = getErrorMessage();

  return (
    <div className="fallback-container">
      <div style={{ maxWidth: '500px' }}>
        <h2>{title}</h2>
        <p>{message}</p>

        {tips.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
              Troubleshooting Tips:
            </h3>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* If content loaded, show direct link */}
        {content && content.url && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
              View content in browser instead:
            </p>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
              }}
            >
              Open Content
            </a>
          </div>
        )}

        {/* Back button */}
        <button
          className="button"
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            marginTop: '16px',
          }}
        >
          ← Back to Home
        </button>

        {/* Support info */}
        <div style={{
          marginTop: '32px',
          fontSize: '0.85rem',
          opacity: 0.7,
        }}>
          <p>
            Need help?{' '}
            <a
              href="https://github.com/yourusername/portal-ar#troubleshooting"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white', textDecoration: 'underline' }}
            >
              View troubleshooting guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OfflineFallback;
