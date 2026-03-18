import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  FileTextIcon, 
  Share2Icon, 
  LightbulbIcon, 
  PlusIcon,
  LogOutIcon,
  UserIcon
} from './Icons';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  return (
    <>
      {}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        ></div>
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <NavLink to="/" className="sidebar-logo">
          <div className="logo-icon">
            <LightbulbIcon size={20} color="white" />
          </div>
          <span>IdeaConnector</span>
        </NavLink>

        <nav className="nav-section">
          {}
          <div className="nav-label">Main</div>
          
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end
            onClick={onClose}
          >
            <HomeIcon className="nav-link-icon" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/notes" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end
            onClick={onClose}
          >
            <FileTextIcon className="nav-link-icon" />
            <span>My Notes</span>
          </NavLink>

          <NavLink 
            to="/graph" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Share2Icon className="nav-link-icon" />
            <span>Graph View</span>
          </NavLink>

          <NavLink 
            to="/ideas" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <LightbulbIcon className="nav-link-icon" />
            <span>Idea Generator</span>
          </NavLink>
          
          <div className="nav-label" style={{ marginTop: '1.5rem' }}>Actions</div>
          
          <NavLink 
            to="/notes/new" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <PlusIcon className="nav-link-icon" />
            <span>Add Note</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile">
              <div className="user-avatar">
                {user.picture ? (
                  <img src={user.picture} alt="User" style={{width: '100%', height: '100%', borderRadius: '50%'}}/>
                ) : (
                  user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={20} />
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name || 'User'}</div>
                <div className="user-status">Online</div>
              </div>
              <button 
                onClick={onLogout} 
                className="btn-icon" 
                title="Logout"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <LogOutIcon size={18} />
              </button>
            </div>
          ) : (
             <NavLink 
              to="/login" 
              className="nav-link"
              style={{ justifyContent: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}
            >
              <span>Sign In</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
