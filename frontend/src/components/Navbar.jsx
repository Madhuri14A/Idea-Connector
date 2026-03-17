import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"></span>
          Idea Connector
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              <span className="nav-icon"></span>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/notes" className="nav-link">
              <span className="nav-icon"></span>
              Notes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/graph" className="nav-link">
              <span className="nav-icon"></span>
              Graph
            </NavLink>
          </li>
        </ul>

        <div className="nav-actions">
          <Link to="/notes/new" className="btn-new-note">
            <span className="btn-icon">✨</span>
            New Note
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
