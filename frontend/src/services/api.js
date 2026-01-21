import axios from 'axios';

const API_URL = 'https://notes-app-backend-mga4.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL, // This adds API_URL as prefix to all requests
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

// Response interceptor (optional but recommended)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expired, redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ CORRECT: Auth API functions (use RELATIVE paths)
export const authAPI = {
  login: (data) => api.post('/login', data), // ✅ '/login' not `${API_URL}/login`
  register: (data) => api.post('/signup', data), // ✅ '/signup' not `${API_URL}/signup`
  getProfile: () => api.get('/profile') // ✅ '/profile' not `${API_URL}/profile`
};

// Notes API functions (these are already correct)
export const notesAPI = {
  getAllNotes: () => api.get('/notes'),
  getNoteById: (id) => api.get(`/notes/${id}`),
  createNote: (noteData) => api.post('/notes', noteData),
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

export default api;