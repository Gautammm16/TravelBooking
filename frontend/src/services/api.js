import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  withCredentials: true
});

// Add request interceptor for JWT
API.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;