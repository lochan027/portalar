/**
 * Controls Component
 * 
 * On-screen UI controls for AR experience:
 * - Back button (return to landing)
 * - Info button (show/hide instructions)
 * - Camera status indicator
 */

import React from 'react';

function Controls({ onBack, onInfo, cameraReady }) {
  return (
    <div className="ar-controls">
      {/* Camera status indicator */}
      <div
        className="control-button"
        style={{
          background: cameraReady ? 'rgba(76, 217, 100, 0.9)' : 'rgba(255, 59, 48, 0.9)',
          cursor: 'default',
        }}
        title={cameraReady ? 'Camera active' : 'Initializing camera...'}
      >
        📷
      </div>

      {/* Info button */}
      <button
        className="control-button"
        onClick={onInfo}
        title="Show instructions"
        aria-label="Show instructions"
      >
        ℹ️
      </button>

      {/* Back button */}
      <button
        className="control-button"
        onClick={onBack}
        title="Go back"
        aria-label="Go back to home"
      >
        ← 
      </button>
    </div>
  );
}

export default Controls;
