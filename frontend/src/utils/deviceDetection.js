/**
 * Device Detection Utility
 * 
 * Checks browser and device capabilities for WebAR support.
 * Returns detailed information about what's supported and what's not.
 */

/**
 * Check if device supports WebAR
 */
export function checkWebARSupport() {
  const result = {
    supported: true,
    camera: false,
    https: false,
    browser: '',
    error: null,
  };

  // Check HTTPS (required for camera access)
  result.https = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  
  if (!result.https) {
    result.supported = false;
    result.error = 'HTTPS required for camera access. Use localhost for development or deploy to HTTPS.';
    return result;
  }

  // Check for MediaDevices API (camera access)
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    result.supported = false;
    result.error = 'Camera API not available. Your browser may not support WebRTC.';
    return result;
  }

  result.camera = true;

  // Detect browser
  const ua = navigator.userAgent;
  
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    result.browser = 'Safari';
    
    // Check iOS version
    const match = ua.match(/OS (\d+)_/);
    if (match) {
      const iosVersion = parseInt(match[1]);
      if (iosVersion < 11) {
        result.supported = false;
        result.error = 'iOS 11.3+ required for WebAR. Please update your device.';
      }
    }
  } else if (/Chrome/i.test(ua)) {
    result.browser = 'Chrome';
  } else if (/Firefox/i.test(ua)) {
    result.browser = 'Firefox';
  } else if (/Edge/i.test(ua)) {
    result.browser = 'Edge';
  } else {
    result.browser = 'Unknown';
    result.supported = false;
    result.error = 'Unsupported browser. Please use Safari (iOS), Chrome (Android), or Firefox.';
  }

  return result;
}

/**
 * Request camera permission
 */
export async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    // Stop stream immediately - we just wanted to check permission
    stream.getTracks().forEach(track => track.stop());

    return { granted: true };
  } catch (error) {
    console.error('Camera permission error:', error);

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return {
        granted: false,
        error: 'Camera permission denied. Please allow camera access in your browser settings.',
      };
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return {
        granted: false,
        error: 'No camera found on this device.',
      };
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return {
        granted: false,
        error: 'Camera is already in use by another application.',
      };
    } else {
      return {
        granted: false,
        error: `Camera error: ${error.message}`,
      };
    }
  }
}

/**
 * Detect device type
 */
export function getDeviceType() {
  const ua = navigator.userAgent;
  
  if (/iPad|tablet/i.test(ua)) {
    return 'tablet';
  } else if (/mobile/i.test(ua)) {
    return 'mobile';
  } else {
    return 'desktop';
  }
}

/**
 * Check if iOS device
 */
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if Android device
 */
export function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get device pixel ratio (for high-DPI screens)
 */
export function getPixelRatio() {
  return window.devicePixelRatio || 1;
}

/**
 * Check if device is in landscape orientation
 */
export function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

/**
 * Check if device supports WebGL (required for 3D rendering)
 */
export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

const deviceDetection = {
  checkWebARSupport,
  requestCameraPermission,
  getDeviceType,
  isIOS,
  isAndroid,
  getPixelRatio,
  isLandscape,
  supportsWebGL,
};

export default deviceDetection;
