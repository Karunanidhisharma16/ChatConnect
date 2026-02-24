import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + "/api";
// const API_URL = 'http://localhost:5000/api';
// const API_URL = 'https://chatconnect-2siz.onrender.com/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
};

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getContacts: () => api.get('/users/contacts'),
  searchUser: (username) => api.get(`/users/search?username=${username}`),
  addContact: (id) => api.post(`/users/add-contact/${id}`),
  getUserById: (id) => api.get(`/users/${id}`)
};


export const messageAPI = {
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (data) => api.post('/messages', data)
};

export default api;

