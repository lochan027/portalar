/**
 * AR Overlay Component
 * 
 * Displays content anchored to detected marker.
 * Renders different UI based on content type:
 * - Video: video player with controls
 * - News: text card with headline/summary
 * - 3D: model viewer (rendered in A-Frame scene)
 * - Image: full-screen image with caption
 */

import React, { useEffect, useRef } from 'react';

function AROverlay({ content, markerId, onInteraction }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Auto-play video when marker appears (if video content)
    if (content.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Autoplay blocked:', err);
      });
    }
  }, [content]);

  function handleCTAClick() {
    if (content.ctaUrl) {
      onInteraction();
      window.open(content.ctaUrl, '_blank');
    }
  }

  // Video content
  if (content.type === 'video') {
    return (
      <div 
        className="ar-overlay" 
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="content-card" style={getCardStyle(content.style)}>
          {content.title && <h2>{content.title}</h2>}
          
          <video
            ref={videoRef}
            src={content.videoUrl}
            poster={content.posterUrl}
            controls
            playsInline
            muted
            loop
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '12px',
              marginBottom: '16px',
            }}
          />

          {content.ctaText && (
            <button
              className="cta-button"
              onClick={handleCTAClick}
              style={getCTAStyle(content.style)}
            >
              {content.ctaText}
            </button>
          )}
        </div>
      </div>
    );
  }

  // News content
  if (content.type === 'news') {
    return (
      <div 
        className="ar-overlay"
        style={{
          bottom: '80px',
          left: '20px',
          right: '20px',
        }}
      >
        <div className="content-card" style={getCardStyle(content.style)}>
          {content.imageUrl && (
            <img
              src={content.imageUrl}
              alt={content.title}
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            />
          )}

          <h2>{content.title}</h2>
          <p>{content.summary}</p>

          {content.ctaText && (
            <button
              className="cta-button"
              onClick={handleCTAClick}
              style={getCTAStyle(content.style)}
            >
              {content.ctaText}
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3D content (renders in A-Frame scene, minimal overlay UI)
  if (content.type === '3d') {
    return (
      <div 
        className="ar-overlay"
        style={{
          bottom: '80px',
          left: '20px',
          right: '20px',
        }}
      >
        <div className="content-card" style={getCardStyle(content.style)}>
          <h2>{content.title}</h2>
          {content.summary && <p>{content.summary}</p>}

          {content.ctaText && (
            <button
              className="cta-button"
              onClick={handleCTAClick}
              style={getCTAStyle(content.style)}
            >
              {content.ctaText}
            </button>
          )}
        </div>

        {/* Render 3D model in A-Frame marker */}
        {renderAFrameModel(content.modelUrl)}
      </div>
    );
  }

  // Image content
  if (content.type === 'image') {
    return (
      <div 
        className="ar-overlay"
        style={{
          bottom: '80px',
          left: '20px',
          right: '20px',
        }}
      >
        <div className="content-card" style={getCardStyle(content.style)}>
          {content.imageUrl && (
            <img
              src={content.imageUrl}
              alt={content.title}
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            />
          )}

          {content.title && <h2>{content.title}</h2>}
          {content.summary && <p>{content.summary}</p>}

          {content.ctaText && (
            <button
              className="cta-button"
              onClick={handleCTAClick}
              style={getCTAStyle(content.style)}
            >
              {content.ctaText}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getCardStyle(style) {
  if (!style) return {};
  
  return {
    backgroundColor: style.backgroundColor || 'rgba(0, 0, 0, 0.85)',
    color: style.textColor || '#ffffff',
  };
}

function getCTAStyle(style) {
  if (!style || !style.accentColor) return {};
  
  return {
    background: style.accentColor,
  };
}

function renderAFrameModel(modelUrl) {
  // Inject 3D model into A-Frame marker
  // This is a workaround since we can't directly inject A-Frame entities from React
  React.useEffect(() => {
    if (!modelUrl) return;

    const marker = document.querySelector('[ar-marker]');
    if (!marker) return;

    // Remove existing model
    const existingModel = marker.querySelector('.ar-3d-model');
    if (existingModel) {
      marker.removeChild(existingModel);
    }

    // Create new model entity
    const model = document.createElement('a-entity');
    model.className = 'ar-3d-model';
    model.setAttribute('gltf-model', modelUrl);
    model.setAttribute('scale', '0.5 0.5 0.5');
    model.setAttribute('position', '0 0 0');
    model.setAttribute('rotation', '0 0 0');
    
    // Add animation (slow rotation)
    model.setAttribute('animation', {
      property: 'rotation',
      to: '0 360 0',
      dur: 10000,
      easing: 'linear',
      loop: true,
    });

    marker.appendChild(model);

    return () => {
      if (marker.contains(model)) {
        marker.removeChild(model);
      }
    };
  }, [modelUrl]);

  return null;
}

export default AROverlay;
