/**
 * Admin Dashboard Component (Simplified)
 * 
 * Basic admin interface for:
 * - Login
 * - Content management
 * - Analytics viewing
 * 
 * For a full-featured dashboard, consider building a separate admin app.
 */

import React, { useState } from 'react';
import { login } from '../services/api';

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(password);
      localStorage.setItem('admin_token', response.token);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="landing-page">
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <h1>🔐 Admin Login</h1>
          <p style={{ marginBottom: '2rem' }}>
            Enter admin password to access the dashboard
          </p>

          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                marginBottom: '16px',
              }}
              required
            />

            {error && (
              <div style={{
                background: 'rgba(255, 59, 48, 0.2)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="button"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
            <p>Default credentials (demo):</p>
            <p>Password: demo123</p>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              Configure via: <code>npm run generate-password</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <h1>📊 Admin Dashboard</h1>
      <p>Content management and analytics</p>

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '16px',
        marginTop: '2rem',
        maxWidth: '600px',
        textAlign: 'left',
      }}>
        <h3>Coming Soon</h3>
        <ul style={{ lineHeight: '2' }}>
          <li>✅ Authentication working</li>
          <li>🚧 Content editor (use API directly for now)</li>
          <li>🚧 Analytics dashboard</li>
          <li>🚧 Perplexity integration UI</li>
          <li>🚧 Marker generator</li>
        </ul>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <h4>API Endpoints:</h4>
          <code style={{ fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
            POST /api/content/:markerId<br/>
            GET /api/analytics<br/>
            POST /api/perplexity/summary
          </code>
        </div>

        <button
          className="button"
          onClick={() => {
            localStorage.removeItem('admin_token');
            setIsAuthenticated(false);
          }}
          style={{ marginTop: '2rem' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
