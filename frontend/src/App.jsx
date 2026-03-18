import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
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

  if (loading) {
    return <div className="loading" style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh', color: 'var(--primary)'}}>Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId="768801507802-rqg1u6g4vmllrabhids9ocjmg91jdtab.apps.googleusercontent.com">
      <Router>
        <div className="app-container">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            user={user}
            onLogout={handleLogout}
          />
          
          <div className="main-content">
            <Navbar 
              isAuthenticated={isAuthenticated} 
              setIsAuthenticated={setIsAuthenticated} 
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
            
            <ErrorBoundary>
              <div className="content-wrapper">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/notes" element={<NotesList />} />
                  <Route 
                    path="/notes/new" 
                    element={isAuthenticated ? <AddNote /> : <Login redirectTo="/notes/new" />} 
                  />
                  <Route path="/notes/:id" element={<NoteDetail />} />
                  <Route path="/graph" element={<GraphView />} />
                  <Route path="/ideas" element={isAuthenticated ? <Ideas /> : <Login redirectTo="/ideas" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
