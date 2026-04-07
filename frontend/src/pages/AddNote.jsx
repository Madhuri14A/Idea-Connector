import React, { useState } from 'react';
import { createNote } from '../utils/api';
import { addGuestNote, getGuestNotes, GUEST_LIMIT } from '../utils/guestNotes';
import { useNavigate, Link } from 'react-router-dom';
import { FileTextIcon } from '../components/Icons';
import GuestBanner from '../components/GuestBanner';
import './AddNote.css';

function AddNote({ isGuest = false }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const guestNotes = isGuest ? getGuestNotes() : [];
  const guestLimitReached = isGuest && guestNotes.length >= GUEST_LIMIT;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return; 
    }
    setError('');
    setLoading(true);
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (isGuest) {
        const result = addGuestNote({ title: title.trim(), content: content.trim(), tags: tagArray });
        if (!result) {
          setError('Please sign in to continue adding more notes.');
          setLoading(false);
          return;
        }
        navigate('/try');
      } else {
        await createNote({ title, content, tags: tagArray });
        navigate('/notes');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to create note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (guestLimitReached) {
    return (
      <div className="add-note">
        <div className="form-container">
          <GuestBanner currentPage="notes" />
          <div className="guest-limit-gate">
            <div className="gate-icon" aria-hidden="true"><FileTextIcon size={34} /></div>
            <h2>Continue with a free account</h2>
            <p>Sign in to create unlimited notes, connect them automatically, and get AI suggestions.</p>
            <Link to="/login" className="btn btn-primary">Sign in to continue</Link>
            <Link to="/try" className="gate-back-link">← Back to my trial notes</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-note">
      <div className="form-container">
        {isGuest && <GuestBanner currentPage="notes" />}
        <h1>Create New Note</h1>
        {error && <p className="form-error">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              rows="8"
              required
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. javascript, react, web"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Note'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(isGuest ? '/try' : '/notes')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNote;
