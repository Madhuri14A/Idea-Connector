const GUEST_KEY = 'guestNotes';
export const GUEST_LIMIT = 2;

export const getGuestNotes = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addGuestNote = ({ title, content, tags = [] }) => {
  const notes = getGuestNotes();
  if (notes.length >= GUEST_LIMIT) return null;
  const note = {
    id: `guest-${Date.now()}`,
    title,
    content,
    tags,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(GUEST_KEY, JSON.stringify([...notes, note]));
  return note;
};

export const deleteGuestNote = (id) => {
  const updated = getGuestNotes().filter(n => n.id !== id);
  localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
};

export const setGuestNotes = (notes = []) => {
  localStorage.setItem(GUEST_KEY, JSON.stringify(notes));
};

export const clearGuestNotes = () => {
  localStorage.removeItem(GUEST_KEY);
};

export const computeGuestConnections = (notes) => {
  return notes.map(note => {
    const connections = notes
      .filter(other => other.id !== note.id)
      .map(other => {
        const sharedTags = (note.tags || []).filter(t => (other.tags || []).includes(t));
        const totalTags = new Set([...(note.tags || []), ...(other.tags || [])]).size;
        const strength = totalTags > 0 ? Math.min(0.3 + sharedTags.length / totalTags, 1) : 0.5;
        return {
          note: { id: other.id, title: other.title },
          strength,
          createdBy: 'auto',
        };
      });
    return { ...note, connections };
  });
};
