import API from './api';

export const authService = {
  resetPassword: async (token, newPassword) => {
    try {
      const response = await API.patch(`/api/v1/users/resetPassword/${token}`, {
        password: newPassword,
        passwordConfirm: newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // You can add other auth-related functions here
  forgotPassword: async (email) => {
    try {
      const response = await API.post('/api/v1/users/forgotPassword', { email });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};