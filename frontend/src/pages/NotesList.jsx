import React, { useState, useEffect } from 'react';
import { getNotes, deleteNote, searchNotes } from '../utils/api';
import { getGuestNotes, deleteGuestNote } from '../utils/guestNotes';
import GuestBanner from '../components/GuestBanner';
import SearchBar from '../components/SearchBar';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, FileTextIcon } from '../components/Icons';
import './NotesList.css';
import NoteCard from '../components/NoteCard';

function NotesList({ isGuest = false }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchParams, setSearchParams] = useState({ q: '', tags: '', sort: 'recent' });
  const [currentPage, setCurrentPage] = useState(1);
  const NOTES_PER_PAGE = 9;

  const navigate = useNavigate();

  useEffect(() => {
    if (isGuest) return;
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

  useEffect(() => {
    if (!isGuest) return;
    setNotes(getGuestNotes());
    setLoading(false);
  }, [isGuest]);

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
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    try {
      if (isGuest) {
        deleteGuestNote(id);
        setNotes(prev => prev.filter(note => note.id !== id));
        return;
      }
      await deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const totalPages = Math.ceil(notes.length / NOTES_PER_PAGE);
  const paginatedNotes = notes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading your notes...</p>
    </div>
  );

  return (
    <div className="notes-page-container">
      {isGuest && <GuestBanner currentPage="notes" />}
      <div className="notes-page-header">
        <div className="header-title-section">
          <div className="header-icon-wrapper">
            <FileTextIcon size={28} color="white" />
          </div>
          <div>
            <h1>My Notes</h1>
            <p className="subtitle">{isGuest ? 'Organize here' : 'Manage and organize your notes'}</p>
          </div>
        </div>
        
        <Link to={isGuest ? '/try/notes/new' : '/notes/new'} className="btn-create-note">
          <PlusIcon size={20} />
          <span>New Note</span>
        </Link>
      </div>

      {!isGuest && (
        <div className="notes-tools-section">
          <SearchBar onSearch={handleSearch} searchParams={searchParams} />
          {searching && <p className="subtitle">Searching...</p>}
        </div>
      )}
      
      <div className="notes-content">
        {notes.length > 0 ? (
          <>
            <div className="notes-results-bar">
              <span className="notes-count">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
              {totalPages > 1 && (
                <span className="notes-page-indicator">Page {currentPage} of {totalPages}</span>
              )}
            </div>
            <div className="modern-notes-grid">
              {paginatedNotes.map((note, idx) => (
                <NoteCard 
                  key={note.id}
                  note={note}
                  onDelete={handleDelete}
                  onView={() => navigate(`/notes/${note.id}`)}
                  isPendingDelete={false}
                  cardIndex={(currentPage - 1) * NOTES_PER_PAGE + idx}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`page-num ${page === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-notes-state">
            <div className="empty-icon-large" aria-hidden="true"><FileTextIcon size={40} /></div>
            <h3>No notes found</h3>
            <p>You haven't created any notes that match this criteria yet.</p>
            <Link to={isGuest ? '/try/notes/new' : '/notes/new'} className="btn-create-note">
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
