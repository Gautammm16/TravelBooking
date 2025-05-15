// AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = '/v1/users';

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

    // Store token in localStorage
    localStorage.setItem('token', data.token);
    
    // Set default auth header for axios
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    // Create user object WITH the token
    const userData = {
      ...data.data.user, // all user info from API
      token: data.token // include the token
    };

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


const googleLogin = async (googleData) => {
  try {
    setLoading(true);
    setError(null);

    // Extract token from credential response
    const token = googleData?.credential;
    if (!token) {
      throw new Error('No credential received from Google');
    }

    // Debug - log token header
    const tokenHeader = JSON.parse(atob(token.split('.')[0]));
    console.log('Google token header:', tokenHeader);

    // Verify token structure
    if (token.split('.').length !== 3) {
      throw new Error('Invalid JWT structure');
    }

    const response = await api.post(`${API_BASE}/google-login`, 
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 10000
      }
    );

    if (!response.data?.token) {
      throw new Error('Invalid server response - missing token');
    }

    // Store token and update state
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    const userData = response.data.data.user;
    setUser(userData);
    
    console.log('Google login successful:', userData);
    return userData;
  } catch (error) {
    let errorMessage = 'Google login failed';
    
    if (error.response) {
      // Server responded with error status
      console.error('Server error response:', error.response.data);
      errorMessage = error.response.data?.message || errorMessage;
      
      // Check for specific error cases
      if (error.response.status === 401) {
        errorMessage = 'Google authentication failed - please try again';
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received:', error.request);
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Request setup error
      console.error('Request error:', error.message);
    }

    setError(errorMessage);
    throw new Error(errorMessage);
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
    googleLogin,
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
