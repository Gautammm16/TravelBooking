import API from './api';

export const register = async (userData) => {
  const response = await API.post('/users/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await API.post('/users/login', credentials);
  return response.data;
};