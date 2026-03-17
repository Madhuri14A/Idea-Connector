import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import GraphView from './pages/GraphView';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NotesList from './pages/NotesList';
import AddNote from './pages/AddNote';
import NoteDetail from './pages/NoteDetail';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId="768801507802-rqg1u6g4vmllrabhids9ocjmg91jdtab.apps.googleusercontent.com">
      <Router>
        <div className="app">
          <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<NotesList />} />
            <Route 
              path="/notes/new" 
              element={isAuthenticated ? <AddNote /> : <Login redirectTo="/notes/new" />} 
            />
            <Route path="/notes/:id" element={<NoteDetail />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
