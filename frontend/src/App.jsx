import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import GraphView from './pages/GraphView';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NotesList from './pages/NotesList';
import AddNote from './pages/AddNote';
import NoteDetail from './pages/NoteDetail';
import Ideas from './pages/Ideas';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  if (loading) {
    return <div className="loading" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh', color: 'var(--primary)'}}>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          user={user}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        />
        
        <div className="main-content">
          <Navbar 
            isAuthenticated={isAuthenticated} 
            onLogout={handleLogout}
            user={user}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <ErrorBoundary>
            <div className="content-wrapper">
              <Routes>
                <Route path="/" element={<Dashboard isAuthenticated={isAuthenticated} />} />
                <Route path="/notes" element={isAuthenticated ? <NotesList /> : <Navigate to="/login" replace />} />
                <Route 
                  path="/notes/new" 
                  element={isAuthenticated ? <AddNote /> : <Login redirectTo="/notes/new" onLogin={handleLogin} />} 
                />
                <Route path="/notes/:id" element={isAuthenticated ? <NoteDetail /> : <Navigate to="/login" replace />} />
                <Route path="/graph" element={isAuthenticated ? <GraphView /> : <Navigate to="/login" replace />} />
                <Route path="/ideas" element={isAuthenticated ? <Ideas /> : <Login redirectTo="/ideas" onLogin={handleLogin} />} />
                <Route path="/settings" element={isAuthenticated ? <Settings onUserUpdate={setUser} /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* Guest / trial routes - no auth required */}
                <Route path="/try" element={<NotesList isGuest />} />
                <Route path="/try/notes/new" element={<AddNote isGuest />} />
                <Route path="/try/graph" element={<GraphView isGuest />} />
                <Route path="/try/ideas" element={<Ideas isGuest />} />
              </Routes>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </Router>
  );
}

export default App;
