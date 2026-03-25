import React, { useState, useEffect } from 'react';
import { getNotes } from '../utils/api';
import { timeAgo, parseDate } from '../utils/date';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileTextIcon, Share2Icon, LightbulbIcon, WandIcon,
  CheckIcon, ArrowRightIcon, SparkleIcon, NetworkIcon
} from '../components/Icons';
import './Dashboard.css';

function Dashboard({ isAuthenticated }) {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
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

  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const notesRes = await getNotes();
      const fetched = notesRes.data;
      setAllNotes(fetched);
      setNotes(fetched.slice(0, 4));
      const totalNotes = fetched.length;
      const totalTags = new Set(fetched.flatMap(n => n.tags || [])).size;
      const totalConnections = Math.floor(
        fetched.reduce((sum, note) => sum + (note.connections?.length || 0), 0) / 2
      );
      setStats({ totalNotes, totalTags, totalConnections });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    if (!isAuthenticated) {
      setNotes([]);
      setAllNotes([]);
      setStats({ totalNotes: 0, totalTags: 0, totalConnections: 0 });
      setLoading(false);
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const getTagColor = (tag) => {
    const colors = {
      'react': '#61DAFB', 'javascript': '#F7DF1E', 'blockchain': '#627EEA',
      'go': '#00ADD8', 'css': '#1572B6', 'python': '#3776AB',
      'ai': '#FF6B6B', 'database': '#4ECDC4', 'neo4j': '#007FBA'
    };
    return colors[tag?.toLowerCase()] || '#6366F1';
  };

  const localDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getActivityData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = localDateStr(d);
      const count = allNotes.filter(n => {
        if (!n.createdAt) return false;
        const nd = parseDate(n.createdAt);
        if (isNaN(nd.getTime())) return false;
        return localDateStr(nd) === dateStr;
      }).length;
      days.push({ label, count });
    }
    return days;
  };

  const activityData = getActivityData();
  const maxActivity = Math.max(...activityData.map(d => d.count), 1);

  const ideaGenVisited = localStorage.getItem('ideaGeneratorVisited') === 'true';

  const onboardingSteps = [
    { id: 'note',  label: 'Create your first note',    done: stats.totalNotes > 0,       path: '/notes/new' },
    { id: 'tags',  label: 'Add tags to connect ideas', done: stats.totalTags > 0,        path: '/notes/new' },
    { id: 'graph', label: 'Explore the Graph View',    done: stats.totalConnections > 0, path: '/graph' },
    { id: 'ideas', label: 'Try the Idea Generator',    done: ideaGenVisited,             path: '/ideas' },
  ];
  const onboardingDone = onboardingSteps.filter(s => s.done).length;
  const showOnboarding = isAuthenticated && stats.totalNotes < 5;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your knowledge base...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="landing">

        <div className="landing-hero">
          <div className="landing-badge">
            <SparkleIcon size={13} />
            AI-powered knowledge base
          </div>
          <h1 className="landing-headline">
            Your ideas deserve<br />
            <span className="landing-accent">better connections</span>
          </h1>
          <p className="landing-sub">
            Write notes, let AI find the links, visualize your thinking as a graph.
            IdeaConnector turns scattered thoughts into a structured knowledge map.
          </p>
          <div className="landing-actions">
            <button className="landing-btn-primary" onClick={() => navigate('/login')}>
              Get started free
            </button>
            <button className="landing-btn-ghost" onClick={() => navigate('/login')}>
              Sign in <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>

        <div className="landing-features">
          <div className="landing-feature">
            <div className="lf-icon">
              <FileTextIcon size={22} />
            </div>
            <h3>Capture notes</h3>
            <p>Write anything — ideas, research, code snippets, thoughts. Tag them to build context.</p>
          </div>

          <div className="landing-feature">
            <div className="lf-icon">
              <Share2Icon size={22} />
            </div>
            <h3>Auto-connect ideas</h3>
            <p>AI automatically finds relationships between your notes and maps how they relate.</p>
          </div>

          <div className="landing-feature">
            <div className="lf-icon">
              <NetworkIcon size={22} />
            </div>
            <h3>Visualize the graph</h3>
            <p>See your entire knowledge base as an interactive graph. Spot patterns you didn’t notice.</p>
          </div>

          <div className="landing-feature">
            <div className="lf-icon">
              <LightbulbIcon size={22} />
            </div>
            <h3>Generate project ideas</h3>
            <p>Tell the AI to cross-pollinate your notes and surface unique project ideas tailored to you.</p>
          </div>
        </div>

        <div className="landing-cta-strip">
          <p>Ready to connect your thinking?</p>
          <button className="landing-btn-primary" onClick={() => navigate('/login')}>
            Start for free
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}!</h1>
          <p className="dash-subtitle">
            <span className="dash-stat-inline" onClick={() => navigate('/notes')}>{stats.totalNotes} notes</span>
            <span className="dash-dot">·</span>
            <span className="dash-stat-inline" onClick={() => navigate('/graph')}>{stats.totalConnections} connections</span>
            <span className="dash-dot">·</span>
            <span className="dash-stat-inline">{stats.totalTags} topics</span>
          </p>
        </div>
        <button className="dash-new-btn" onClick={() => navigate('/notes/new')}>
          + New Note
        </button>
      </div>

      <div className="dash-body">

        {/* ── Top row: Activity (big) + Checklist (small) ── */}
        <div className="dash-top-row">

          <div className="dash-activity-box">
            <h2 className="dash-section-title">Activity — last 7 days</h2>
            <div className="activity-chart">
              {activityData.map((day, i) => (
                <div key={i} className="activity-col">
                  <div className="activity-bar-wrap">
                    <div
                      className="activity-bar"
                      style={{ height: `${(day.count / maxActivity) * 100}%` }}
                      title={`${day.count} note${day.count !== 1 ? 's' : ''}`}
                    >
                      {day.count > 0 && <span className="activity-count">{day.count}</span>}
                    </div>
                  </div>
                  <span className="activity-label">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-checklist-box">
            {showOnboarding ? (
              <>
                <h2 className="dash-section-title">Getting Started</h2>
                <div className="onboarding-progress-bar">
                  <div
                    className="onboarding-progress-fill"
                    style={{ width: `${(onboardingDone / onboardingSteps.length) * 100}%` }}
                  />
                </div>
                <p className="onboarding-count">{onboardingDone} of {onboardingSteps.length} done</p>
                <ul className="onboarding-list">
                  {onboardingSteps.map(step => (
                    <li
                      key={step.id}
                      className={`onboarding-item ${step.done ? 'done' : ''}`}
                      onClick={() => !step.done && navigate(step.path)}
                    >
                      <span className="onboarding-check">{step.done ? <CheckIcon size={10} /> : null}</span>
                      <span className="onboarding-label">{step.label}</span>
                      {!step.done && <span className="onboarding-arrow"><ArrowRightIcon size={12} /></span>}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2 className="dash-section-title">Explore</h2>
                <div className="quick-links">
                  <button className="quick-link" onClick={() => navigate('/notes')}>
                    <FileTextIcon size={15} /> All Notes
                  </button>
                  <button className="quick-link" onClick={() => navigate('/graph')}>
                    <Share2Icon size={15} /> Graph View
                  </button>
                  <button className="quick-link" onClick={() => navigate('/ideas')}>
                    <LightbulbIcon size={15} /> Idea Generator
                  </button>
                  <button className="quick-link" onClick={() => navigate('/weaver')}>
                    <WandIcon size={15} /> Idea Weaver
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

        {/* ── Bottom: Recent Notes full width ── */}
        <div className="dash-recent-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Recent Notes</h2>
            {isAuthenticated && notes.length > 0 && (
              <Link to="/notes" className="view-all">View All →</Link>
            )}
          </div>

          {notes.length > 0 ? (
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
                    />
                    <h3>{note.title}</h3>
                  </div>
                  <p className="note-content">
                    {note.content.substring(0, 120)}{note.content.length > 120 && '...'}
                  </p>
                  <div className="note-footer">
                    <div className="note-tags">
                      {note.tags?.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="tag-pill"
                          style={{ backgroundColor: getTagColor(tag) + '20', color: getTagColor(tag) }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags?.length > 3 && (
                        <span className="tag-more">+{note.tags.length - 3}</span>
                      )}
                    </div>
                    <span className="note-time">{timeAgo(note.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><FileTextIcon size={40} className="empty-svg-icon" /></div>
              <h3>No notes yet</h3>
              <p>Start building your knowledge base</p>
              <button className="btn-primary" style={{ margin: '0 auto', display: 'block', width: 'fit-content' }} onClick={() => navigate('/notes/new')}>
                Create Your First Note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
