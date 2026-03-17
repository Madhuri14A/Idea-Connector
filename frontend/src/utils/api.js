import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Notes API
export const getNotes = () => api.get('/notes');
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);

// Connections API
export const getConnections = (noteId) => api.get(`/connections/${noteId}`);
export const createConnection = (id1, id2, strength) => api.post('/connections', { id1, id2, strength });
export const deleteConnection = (id1, id2) => api.delete('/connections', { data: { id1, id2 } });

// Search & Suggestions
export const searchNotes = (query, tags, sort) => api.get('/notes/search/query', { params: { q: query, tags, sort } });
export const getSuggestions = () => api.get('/suggestions');
export const generateIdeas = () => api.get('/ideas/generate');
export const getRelatedNotes = (noteId) => api.get(`/notes/${noteId}/related`);

// Stats
export const getStats = () => api.get('/stats');

export default api;
