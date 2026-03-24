import React, { useState, useEffect } from 'react';
import { getNotes, deleteNote, searchNotes } from '../utils/api';
import SearchBar from '../components/SearchBar';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, FileTextIcon } from '../components/Icons';
import './NotesList.css';
import NoteCard from '../components/NoteCard';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchParams, setSearchParams] = useState({ q: '', tags: '', sort: 'recent' });

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const { q, tags, sort } = searchParams;
      if (q || tags || sort !== 'recent') {
        performSearch(searchParams);
      } else {
        fetchNotes();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await getNotes();
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async ({ q, tags, sort }) => {
    try {
      setSearching(true);
      const res = await searchNotes(q, tags, sort);
      setNotes(res.data);
    } catch (error) {
      console.error('Error searching notes:', error);
      setNotes([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (params) => {
    setSearchParams(params);
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
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

      <div className="notes-tools-section">
        <SearchBar onSearch={handleSearch} searchParams={searchParams} />
        {searching && <p className="subtitle">Searching...</p>}
      </div>
      
      <div className="notes-content">
        {notes.length > 0 ? (
          <div className="modern-notes-grid">
            {notes.map(note => (
              <NoteCard 
                key={note.id}
                note={note}
                onDelete={handleDelete}
                onView={() => navigate(`/notes/${note.id}`)}
                isPendingDelete={false}
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
