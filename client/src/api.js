import axios from 'axios';
import { auth } from './firebase'; // Import Firebase auth

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    // Get the fresh token directly from Firebase
    const token = await user.getIdToken(); 
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;