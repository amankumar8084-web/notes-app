import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://notes-app-backend-mga4.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData) => api.post('/signup', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/profile'),
};

// Notes API functions
export const notesAPI = {
  getAllNotes: () => api.get('/notes'),
  getNoteById: (id) => api.get(`/notes/${id}`),
  createNote: (noteData) => api.post('/notes', noteData),
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

export default api;