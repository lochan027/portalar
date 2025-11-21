/**
 * Scan Page Component
 * 
 * Main AR experience page. This component:
 * 1. Initializes camera and AR tracking
 * 2. Fetches marker content from backend
 * 3. Displays AR overlay when marker detected
 * 4. Tracks analytics (scan, view duration, clicks)
 * 
 * Uses A-Frame + AR.js for marker tracking.
 * Falls back to image marker if QR-based tracking fails.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AROverlay from './AROverlay';
import Controls from './Controls';
import OfflineFallback from './OfflineFallback';
import { fetchContent } from '../services/api';
import { trackEvent, startSession, endSession } from '../services/analytics';
import { checkWebARSupport } from '../utils/deviceDetection';

function ScanPage() {
  const { markerId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markerVisible, setMarkerVisible] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [webARSupported, setWebARSupported] = useState(true);

  const sessionIdRef = useRef(null);
  const scanStartTimeRef = useRef(null);
  const sceneRef = useRef(null);

  // Check WebAR support on mount
  useEffect(() => {
    const support = checkWebARSupport();
    setWebARSupported(support.supported);
    
    if (!support.supported) {
      setError(support.error || 'WebAR not supported on this device');
      setLoading(false);
    }
  }, []);

  // Fetch content for this marker
  useEffect(() => {
    if (!webARSupported) return;

    async function loadContent() {
      try {
        setLoading(true);
        const data = await fetchContent(markerId);
        setContent(data);

        // Initialize analytics session
        sessionIdRef.current = startSession(markerId);

        // Track initial scan event
        trackEvent({
          markerId,
          eventType: 'scan',
          sessionId: sessionIdRef.current,
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to load content:', err);
        setError(err.message || 'Failed to load AR content');
        setLoading(false);
      }
    }

    loadContent();

    // Cleanup: track session end
    return () => {
      if (sessionIdRef.current) {
        endSession(markerId, sessionIdRef.current);
      }
    };
  }, [markerId, webARSupported]);

  // Initialize AR scene after content loaded
  useEffect(() => {
    if (!content || !webARSupported) return;

    // Wait for A-Frame to be ready
    if (!window.AFRAME) {
      console.error('A-Frame not loaded');
      return;
    }

    initializeARScene();

    return () => {
      cleanupARScene();
    };
  }, [content, webARSupported]);

  function initializeARScene() {
    const scene = sceneRef.current;
    if (!scene) return;

    // AR.js marker tracking events
    const marker = scene.querySelector('[ar-marker]');
    
    if (marker) {
      marker.addEventListener('markerFound', handleMarkerFound);
      marker.addEventListener('markerLost', handleMarkerLost);
    }

    // Camera ready event
    scene.addEventListener('camera-init', () => {
      console.log('Camera initialized');
      setCameraReady(true);
      setTimeout(() => setShowInstructions(false), 5000);
    });

    // Handle AR.js loading
    scene.addEventListener('arjs-video-loaded', () => {
      console.log('AR.js video loaded');
      setCameraReady(true);
    });
  }

  function cleanupARScene() {
    const scene = sceneRef.current;
    if (!scene) return;

    const marker = scene.querySelector('[ar-marker]');
    if (marker) {
      marker.removeEventListener('markerFound', handleMarkerFound);
      marker.removeEventListener('markerLost', handleMarkerLost);
    }
  }

  function handleMarkerFound() {
    console.log('Marker detected!');
    setMarkerVisible(true);
    setShowInstructions(false);
    scanStartTimeRef.current = Date.now();
  }

  function handleMarkerLost() {
    console.log('Marker lost');
    setMarkerVisible(false);

    // Track view duration
    if (scanStartTimeRef.current) {
      const duration = (Date.now() - scanStartTimeRef.current) / 1000;
      trackEvent({
        markerId,
        eventType: 'viewDuration',
        sessionId: sessionIdRef.current,
        duration,
      });
      scanStartTimeRef.current = null;
    }
  }

  function handleContentClick() {
    trackEvent({
      markerId,
      eventType: 'click',
      sessionId: sessionIdRef.current,
    });
  }

  function handleBack() {
    navigate('/');
  }

  function handleToggleInstructions() {
    setShowInstructions(!showInstructions);
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner-large"></div>
        <p>Loading AR experience...</p>
      </div>
    );
  }

  // Error state
  if (error || !webARSupported) {
    return (
      <OfflineFallback
        markerId={markerId}
        content={content}
        error={error}
        onBack={handleBack}
      />
    );
  }

  // Main AR scene
  return (
    <div className="scan-page">
      {/* A-Frame AR Scene */}
      <div className="ar-scene-container">
        <a-scene
          ref={sceneRef}
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          vr-mode-ui="enabled: false"
          renderer="logarithmicDepthBuffer: true; precision: medium;"
        >
          {/* Camera */}
          <a-entity camera look-controls="enabled: false"></a-entity>

          {/* AR Marker */}
          <a-marker
            ar-marker
            type="pattern"
            url={`/markers/${markerId}.patt`}
            smooth="true"
            smoothCount="10"
            smoothTolerance="0.01"
            smoothThreshold="5"
          >
            {/* Content rendered here by AROverlay component */}
          </a-marker>
        </a-scene>
      </div>

      {/* AR Overlay (appears when marker visible) */}
      {markerVisible && content && (
        <AROverlay
          content={content}
          markerId={markerId}
          onInteraction={handleContentClick}
        />
      )}

      {/* UI Controls */}
      <Controls
        onBack={handleBack}
        onInfo={handleToggleInstructions}
        cameraReady={cameraReady}
      />

      {/* Instructions overlay */}
      {showInstructions && cameraReady && (
        <div className="instructions-overlay">
          📷 Point your camera at the marker
        </div>
      )}
    </div>
  );
}

export default ScanPage;
