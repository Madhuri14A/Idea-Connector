import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNotes, deleteNote, updateNote, getRelatedNotes } from '../utils/api';
import './NoteDetail.css';

function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [relatedNotes, setRelatedNotes] = useState([]);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await getNotes();
      const foundNote = res.data.find(n => n.id === id);
      if (foundNote) {
        setNote(foundNote);
        setEditedNote(foundNote);
        
        // Fetch related notes
        const relatedRes = await getRelatedNotes(id);
        setRelatedNotes(relatedRes.data);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this note?')) {
      try {
        await deleteNote(id);
        navigate('/notes');
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const tagArray = tagInput.split(',').map(t => t.trim()).filter(t => t);
      await updateNote(id, {
        title: editedNote.title,
        content: editedNote.content,
        tags: tagArray
      });
      setNote({ ...editedNote, tags: tagArray });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!note) return <div className="error">Note not found</div>;

  return (
    <div className="note-detail">
      <div className="detail-header">
        <button onClick={() => navigate('/notes')} className="btn btn-secondary">
          ← Back
        </button>
        <div className="detail-actions">
          {!isEditing && (
            <>
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setTagInput(editedNote.tags?.join(', ') || '');
                }}
                className="btn btn-primary"
              >
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editedNote.title}
            onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
            className="title-input"
            placeholder="Note title"
          />
          <textarea
            value={editedNote.content}
            onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
            className="content-textarea"
            placeholder="Note content"
            rows="10"
          />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="tags-input"
            placeholder="Tags (comma-separated)"
          />
          <div className="form-actions">
            <button onClick={handleSave} className="btn btn-primary">Save</button>
            <button onClick={() => {
              setEditedNote(note);
              setTagInput(note.tags?.join(', ') || '');
              setIsEditing(false);
            }} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="note-content">
          <h1>{note.title}</h1>
          <p className="meta">
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </p>
          <div className="tags">
            {note.tags?.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <div className="content">
            {note.content}
          </div>
          
          {/* Related Notes Section */}
          {relatedNotes.length > 0 && (
            <div className="related-notes-section">
              <h2>Related Notes ({relatedNotes.length})</h2>
              <div className="related-notes-list">
                {relatedNotes.map(relatedNote => (
                  <div 
                    key={relatedNote.id} 
                    className="related-note-card"
                    onClick={() => navigate(`/notes/${relatedNote.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="related-note-title">{relatedNote.title}</div>
                    <div className="related-note-similarity">
                      {Math.round(relatedNote.similarity * 100)}% match
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NoteDetail;
