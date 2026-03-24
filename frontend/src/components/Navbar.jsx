import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { MenuIcon, SearchIcon, UserIcon, LogOutIcon, LightbulbIcon } from './Icons';
import './Navbar.css';

function Navbar({ isAuthenticated, onLogout, user, toggleSidebar }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleSearchFocus = () => {
    navigate('/notes');
  };

  return (
    <header className={`top-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <MenuIcon size={24} />
        </button>
        
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <LightbulbIcon size={16} color="white" />
          </div>
          <span>IdeaConnector</span>
        </Link>
        
        {isAuthenticated && (
          <div className="header-search">
             <SearchIcon className="search-icon" size={18} />
             <input 
               type="text" 
               placeholder="Search..." 
               onFocus={handleSearchFocus}
             />
          </div>
        )}
      </div>

      <div className="header-right">
        {isAuthenticated ? (
          <div className="user-mini-profile">
             <div className="avatar-small">
               {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
             </div>
             <span className="user-name-small">{user?.name || 'User'}</span>
             <button onClick={handleLogout} className="btn-icon-only" title="Logout" style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', marginLeft: '0.5rem'}}>
               <LogOutIcon size={18} />
             </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{padding: '0.4rem 1rem'}}>Sign In</Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
