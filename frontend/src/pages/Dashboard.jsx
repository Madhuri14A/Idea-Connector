import React, { useState, useEffect } from 'react';
import { getNotes } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ totalNotes: 0, totalTags: 0, totalConnections: 0 });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Authentication status
  const isAuthenticated = !!localStorage.getItem('token');

  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      const notesRes = await getNotes();
      const allNotes = notesRes.data;
      
      setNotes(allNotes.slice(0, 3));
      
      // Calculate stats
      const totalNotes = allNotes.length;
      const totalTags = new Set(allNotes.flatMap(n => n.tags || [])).size;
      const totalConnections = allNotes.reduce((sum, note) => 
        sum + (note.connections?.length || 0), 0
      ) / 2;
      
      setStats({ totalNotes, totalTags, totalConnections });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    fetchData();
  }, []);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getTagColor = (tag) => {
    const colors = {
      'react': '#61DAFB',
      'javascript': '#F7DF1E',
      'blockchain': '#627EEA',
      'go': '#00ADD8',
      'css': '#1572B6',
      'python': '#3776AB',
      'ai': '#FF6B6B',
      'database': '#4ECDC4',
      'neo4j': '#007FBA'
    };
    return colors[tag?.toLowerCase()] || '#6366F1';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1>{greeting}!</h1>
          <p className="subtitle">
            You have <strong>{stats.totalNotes}</strong> notes across{' '}
            <strong>{stats.totalTags}</strong> topics connected by{' '}
            <strong>{stats.totalConnections}</strong> relationships
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/notes')}>
          <div className="stat-icon">🗒</div>
          <div className="stat-content">
            <h3>{stats.totalNotes}</h3>
            <p>Notes</p>
          </div>
          <div className="stat-trend">+{stats.totalNotes > 0 ? '12%' : '0%'}</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/graph')}>
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <h3>{stats.totalConnections}</h3>
            <p>Connections</p>
          </div>
          <div className="stat-trend">+{stats.totalConnections > 0 ? '8%' : '0%'}</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/ideas')}>
          <div className="stat-icon">💡</div>
          <div className="stat-content">
            <h3>Ideas</h3>
            <p>AI Generator</p>
          </div>
          <div className="stat-trend">→</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/notes/new')}
          >
            <span className="action-icon">📝</span>
            <div className="action-text">
              <strong>New Note</strong>
              <small>Capture an idea</small>
            </div>
          </button>

          <button 
            className="action-btn secondary"
            onClick={() => navigate('/notes')}
          >
            <span className="action-icon">🔗</span>
            <div className="action-text">
              <strong>Browse Notes</strong>
              <small>All your notes</small>
            </div>
          </button>

          <button 
            className="action-btn tertiary"
            onClick={() => navigate('/graph')}
          >
            <span className="action-icon">🕸️</span>
            <div className="action-text">
              <strong>View Graph</strong>
              <small>Visualize knowledge</small>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Notes</h2>
          {isAuthenticated && (
            <Link to="/notes" className="view-all">
              View All →
            </Link>
          )}
        </div>

        {isAuthenticated ? (
          notes.length > 0 ? (
            <div className="notes-list">
              {notes.map(note => (
                <div 
                  key={note.id} 
                  className="note-card-modern"
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <div className="note-header">
                    <div 
                      className="note-indicator"
                      style={{ backgroundColor: getTagColor(note.tags?.[0]) }}
                    ></div>
                    <h3>{note.title}</h3>
                  </div>
                  
                  <p className="note-content">
                    {note.content.substring(0, 120)}
                    {note.content.length > 120 && '...'}
                  </p>
                  
                  <div className="note-footer">
                    <div className="note-tags">
                      {note.tags?.slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="tag-pill"
                          style={{ 
                            backgroundColor: getTagColor(tag) + '20',
                            color: getTagColor(tag)
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags?.length > 3 && (
                        <span className="tag-more">+{note.tags.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="note-meta">
                      <span className="note-time">
                        {getTimeAgo(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No notes yet</h3>
              <p>Start building your knowledge base</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/notes/new')}
              >
                Create Your First Note
              </button>
            </div>
          )
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>Please Log In</h3>
            <p>You need to be logged in to view your recent notes and create a knowledge base.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
              style={{ padding: '0.75rem 2rem', marginTop: '1rem' }}
            >
              Log In Now
            </button>
          </div>
        )}
      </div>


    </div>
  );
}

export default Dashboard;
