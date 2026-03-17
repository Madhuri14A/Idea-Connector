import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GraphView from './pages/GraphView';

// Components
import Navbar from './components/Navbar'; //navigation component

//  Importing Pages
import Dashboard from './pages/Dashboard';
import NotesList from './pages/NotesList';
import AddNote from './pages/AddNote';
import NoteDetail from './pages/NoteDetail';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes" element={<NotesList />} />
          <Route path="/notes/new" element={<AddNote />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/graph" element={<GraphView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
