import React from 'react';
import './NoteCard.css';
import { EyeIcon, TrashIcon } from './Icons';

function NoteCard({ note, onDelete, onView, isPendingDelete = false }) {
  const contentPreview = note.content 
    ? (note.content.length > 120 ? note.content.substring(0, 120) + "..." : note.content) 
    : "No content";

  return (
    <div className="note-card" onClick={onView}>
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={onView} className="action-btn" title="View">
            <EyeIcon size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} 
            className={`action-btn delete${isPendingDelete ? ' confirm' : ''}`}
            title={isPendingDelete ? 'Click again to confirm delete' : 'Delete'}
            style={isPendingDelete ? { background: '#ef4444', color: 'white', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '600' } : {}}
          >
            {isPendingDelete ? '?' : <TrashIcon size={18} />}
          </button>
        </div>
      </div>
      
      <p className="note-preview">{contentPreview}</p>
      
      <div className="note-footer">
        {note.tags?.slice(0, 3).map((tag, i) => (
          <span key={i} className="note-tag">#{tag}</span>
        ))}
        {note.tags?.length > 3 && (
          <span className="note-tag note-tag-more">+{note.tags.length - 3}</span>
        )}
      </div>
    </div>
  );
}

export default NoteCard;
