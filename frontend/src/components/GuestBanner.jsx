import React from 'react';
import { Link } from 'react-router-dom';
import './GuestBanner.css';

function GuestBanner({ currentPage }) {
  return (
    <div className="guest-banner">
      <div className="guest-banner-left">
        <span className="guest-badge">Explore mode</span>
        <nav className="guest-nav">
          <Link to="/try" className={`guest-nav-link${currentPage === 'notes' ? ' active' : ''}`}>
            Notes
          </Link>
          <Link to="/try/graph" className={`guest-nav-link${currentPage === 'graph' ? ' active' : ''}`}>
            Graph
          </Link>
          <Link to="/try/ideas" className={`guest-nav-link${currentPage === 'ideas' ? ' active' : ''}`}>
            Ideas 
          </Link>
        </nav>
      </div>
      <Link to="/login" className="guest-signin-btn">
        Sign in to save everything →
      </Link>
    </div>
  );
}

export default GuestBanner;
