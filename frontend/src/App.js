/**
 * Main App Component
 * 
 * Root component that sets up routing and global context.
 * Routes:
 * - / : Landing page with instructions
 * - /scan/:markerId : AR scanner page
 * - /admin : Admin dashboard
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ScanPage from './components/ScanPage';
import AdminDashboard from './components/AdminDashboard';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  // Hide loading splash when React mounts
  React.useEffect(() => {
    const splash = document.getElementById('loading-splash');
    if (splash) {
      setTimeout(() => {
        splash.classList.add('hidden');
      }, 500);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scan/:markerId" element={<ScanPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
