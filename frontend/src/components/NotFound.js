/**
 * Not Found Component
 * 
 * 404 page for invalid routes
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="fallback-container">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <button
        className="button"
        onClick={() => navigate('/')}
        style={{ marginTop: '24px' }}
      >
        Go to Home
      </button>
    </div>
  );
}

export default NotFound;
