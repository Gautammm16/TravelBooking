import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = '/v1/users';

  // Admin login validator
  const validateAdminCredentials = (email, password) => {
    return email === 'admin@example.com' && password === 'admin123';
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get(`${API_BASE}/me`);

        if (data.email === 'admin@example.com') {
          data.role = 'admin';
        }

        setUser(data.data.user);
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleCleanup();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleCleanup = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post(`${API_BASE}/login`, { email, password });
      
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      const userData = data.data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Add this new method for Google login
  const googleLogin = async (googleData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Send Google credential to your backend
      const { data } = await api.post(`${API_BASE}/google-login`, {
        token: googleData.credential || googleData.tokenId
      });
      
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      const userData = data.data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.post(`${API_BASE}/register`, userData);
      
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      const registeredUser = data.data.user;
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post(`${API_BASE}/logout`);
    } finally {
      handleCleanup();
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post(`${API_BASE}/forgotPassword`, { email });
      return data.message;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.patch(`${API_BASE}/resetPassword/${token}`, {
        password: newPassword,
        passwordConfirm: confirmPassword,
      });

      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      setUser(data.user);
      return data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedFields) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.patch(`${API_BASE}/updateMe`, updatedFields);
      setUser(data.data.user);
      return data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminAccess = () => user?.role === 'admin';

  const value = {
    user,
    loading,
    error,
    isAdmin: checkAdminAccess(),
    login,
    googleLogin, // Add the new googleLogin method to the context value
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkAdminAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};