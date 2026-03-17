import React, { useState, useEffect, useCallback } from 'react';
import { getNotes, deleteNote, searchNotes } from '../utils/api';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';
import './NotesList.css';
import NoteCard from '../components/NoteCard';
import { useNavigate } from 'react-router-dom';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [searchParams, setSearchParams] = useState({ q: '', tags: '', sort: 'recent' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);
  useEffect(() => {
  if (searchParams.q || searchParams.tags) {
    performSearch();
  } else {
    fetchNotes();
  }
}, [searchParams]);

  const fetchNotes = async () => {
  try {
    const res = await getNotes();
    setNotes(res.data);
    
    // Extract all unique tags
    const tags = new Set();
    res.data.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="notes-list">
      <div className="list-header">
        <h1>My Notes</h1>
        <Link to="/notes/new" className="btn btn-primary">+ New Note</Link>
      </div>
<SearchBar onSearch={handleSearch} allTags={allTags} />
      {notes.length > 0 ? (
        <div className="notes-grid">
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
        <div className="empty-state">
          <p>No notes yet. <Link to="/notes/new">Create your first note!</Link></p>
        </div>
      )}
    </div>
  );
}

export default NotesList;
