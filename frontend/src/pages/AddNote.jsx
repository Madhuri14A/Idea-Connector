import React, { useState } from 'react';
import { createNote } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './AddNote.css';

function AddNote() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required!');
      return; 
    }

    setLoading(true);
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await createNote({
        title,
        content,
        tags: tagArray
      });
      navigate('/notes');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-note">
      <div className="form-container">
        <h1>Create New Note</h1>
        
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
              {loading ? 'Creating...' : 'Create Note'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/notes')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNote;
