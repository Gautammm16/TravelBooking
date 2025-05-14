import axios from 'axios';

// Create axios instance with base URL and configurations
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Request interceptor to add auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
// export const login = async (credentials) => {
//   const response = await API.post('/auth/login', credentials);
//   return response.data;
// };

// export const register = async (userData) => {
//   const response = await API.post('/auth/register', userData);
//   return response.data;
// };

// export const logout = async () => {
//   const response = await API.post('/auth/logout');
//   return response.data;
// };

// export const forgotPassword = async (email) => {
//   const response = await API.post('/auth/forgot-password', { email });
//   return response.data;
// };

// export const resetPassword = async (token, password) => {
//   const response = await API.post(`/auth/reset-password/${token}`, { password });
//   return response.data;
// };

// // Tour APIs
// export const getAllTours = async (filters = {}) => {
//   const response = await API.get('/tours', { params: filters });
//   return response.data;
// };

// export const getTourById = async (id) => {
//   const response = await API.get(`/tours/${id}`);
//   return response.data;
// };

// // User APIs
// export const getUserProfile = async () => {
//   const response = await API.get('/users/profile');
//   return response.data;
// };

// export const updateUserProfile = async (userData) => {
//   const response = await API.put('/users/profile', userData);
//   return response.data;
// };

// // Booking APIs
// export const createBooking = async (bookingData) => {
//   const response = await API.post('/bookings', bookingData);
//   return response.data;
// };

// export const getUserBookings = async () => {
//   const response = await API.get('/bookings');
//   return response.data;
// };

// export const cancelBooking = async (bookingId) => {
//   const response = await API.delete(`/bookings/${bookingId}`);
//   return response.data;
// };

// // Wishlist APIs
// export const addToWishlist = async (tourId) => {
//   const response = await API.post('/wishlist', { tourId });
//   return response.data;
// };

// export const removeFromWishlist = async (tourId) => {
//   const response = await API.delete(`/wishlist/${tourId}`);
//   return response.data;
// };

// export const getWishlist = async () => {
//   const response = await API.get('/wishlist');
//   return response.data;
// };

// // Admin APIs
// export const getAllUsers = async () => {
//   const response = await API.get('/admin/users');
//   return response.data;
// };

// export const updateUserRole = async (userId, role) => {
//   const response = await API.put(`/admin/users/${userId}/role`, { role });
//   return response.data;
// };

// export const getSiteStatistics = async () => {
//   const response = await API.get('/admin/statistics');
//   return response.data;
// };

// export const initPayment = async (paymentData) => {
//   try {
//     const response = await API.post('/api/v1/payments/init', paymentData);
//     return response.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };


// Authentication APIs
export const login = async (credentials) => {
  const response = await API.post('/api/v1/users/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await API.post('/api/v1/users/signup', userData);
  return response.data;
};

export const logout = async () => {
  const response = await API.post('/api/v1/users/logout');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post('/v1/users/forgotPassword', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await API.patch(`/api/v1/users/resetPassword/${token}`, { password, passwordConfirm: password });
  return response.data;
};
export default API;