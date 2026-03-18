import React, { useState, useEffect, useCallback } from 'react';
import { getNotes, deleteNote, searchNotes } from '../utils/api';
import SearchBar from '../components/SearchBar';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, FileTextIcon } from '../components/Icons';
import './NotesList.css';
import NoteCard from '../components/NoteCard';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ q: '', tags: '', sort: 'recent' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (searchParams.q || searchParams.tags || searchParams.sort !== 'recent') {
      performSearch();
    } else {
      fetchNotes();
    }
  }, [searchParams]);

  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await searchNotes(searchParams.q, searchParams.tags, searchParams.sort);
      setNotes(res.data);
    } catch (error) {
      console.error('Error searching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((params) => {
    setSearchParams(params);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      try {
        await deleteNote(id);
        setNotes(notes.filter(note => note.id !== id));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading your notes...</p>
    </div>
  );

  return (
    <div className="notes-page-container">
      {/* Page Header */}
      <div className="notes-page-header">
        <div className="header-title-section">
          <div className="header-icon-wrapper">
            <FileTextIcon size={28} color="white" />
          </div>
          <div>
            <h1>My Notes</h1>
            <p className="subtitle">Manage and organize your knowledge base</p>
          </div>
        </div>
        
        <Link to="/notes/new" className="btn-create-note">
          <PlusIcon size={20} />
          <span>New Note</span>
        </Link>
      </div>

      {/* Tools Section (Search & Filter) */}
      <div className="notes-tools-section">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {/* Content Grid */}
      <div className="notes-content">
        {notes.length > 0 ? (
          <div className="modern-notes-grid">
            {notes.map(note => (
              <NoteCard 
                key={note.id}
                note={note}
                onDelete={handleDelete}
                onView={() => navigate(`/notes/${note.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-notes-state">
            <div className="empty-icon-large">📄</div>
            <h3>No notes found</h3>
            <p>You haven't created any notes that match this criteria yet.</p>
            <Link to="/notes/new" className="btn-create-note">
              <PlusIcon size={20} />
              <span>Create Your First Note</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesList;
