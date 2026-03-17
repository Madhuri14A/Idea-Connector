function NoteCard({ note, onDelete, onView }) {
  return (
    <div className="note-item">
      <div className="note-item-header">
        <h3>{note.title}</h3>
        <div className="actions">
          <button onClick={onView} className="btn-icon btn-view" title="View">
            View
          </button>
          <button onClick={() => onDelete(note.id)} className="btn-icon btn-delete" title="Delete">
            Delete
          </button>
        </div>
      </div>
      <p className="content">{note.content.substring(0, 120)}...</p>
      <div className="tags">
        {note.tags?.slice(0, 4).map(tag => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
        {note.tags?.length > 4 && (
          <span className="tag tag-more">+{note.tags.length - 4}</span>
        )}
      </div>
    </div>
  );
}

export default NoteCard;