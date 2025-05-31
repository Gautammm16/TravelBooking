import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ✅ Authenticated API instance
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Attach Authorization token for protected routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Unauthenticated API instance for public routes (no token)
const publicAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// === Auth APIs ===
export const login = async (credentials) => {
  const response = await publicAPI.post('/v1/users/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await publicAPI.post('/v1/users/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await API.post('/v1/users/logout');
  return response.data; 
};

// === Forgot/Reset Password (Public Routes) ===
export const forgotPassword = async (email) => {
  const response = await publicAPI.post('/v1/users/forgot-password', { email });
  return response.data;
};


export const getMe = async () => {
  const response = await API.get('/v1/users/me');
  return response.data;
};


export const verifyResetOTP = async (data) => {
  const response = await publicAPI.post('/v1/users/verify-reset-otp', {
    email: data.email,
    otp: data.otp
  });
  return response.data;
};

export const resetPasswordWithOTP = async (data) => {
  try {
    const response = await API.post(
      '/v1/users/reset-password',
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// === Other Authenticated APIs ===
export const deleteUser = async (userId) => {
  const response = await API.delete(`/v1/users/${userId}`);
  return response.data;
};


export const updateUserData = async (id, data) => {
  try {
    const res = await API.patch(`/v1/users/update-me/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (err) {
    // Enhance error information before throwing
    const error = new Error(err.response?.data?.message || 'Failed to update user');
    error.status = err.response?.status;
    error.data = err.response?.data;
    throw error;
  }
};

export default API;