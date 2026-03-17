import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/');
  };

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
          {isAuthenticated ? (
            <>
              <Link to="/notes/new" className="btn-new-note">
                New Note
              </Link>
              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-login">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
