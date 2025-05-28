// AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpEmail, setOtpEmail] = useState(null);
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
      const isAdmin = email === 'admin@example.com';

      if (data.status === 'unverified' && !isAdmin) {
        setOtpEmail(data.email || email);
        throw new Error(data.message || 'Please verify your email first');
      }

      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      const userData = {
        ...data.data.user,
        token: data.token
      };

      setUser(userData);
      return userData;

    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      setError(message);

      if (message.includes('verify your email')) {
        return { requiresVerification: true, email: otpEmail };
      }

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleData) => {
    try {
      setLoading(true);
      setError(null);
      const token = googleData?.credential;
      if (!token) throw new Error('No credential received from Google');

      const response = await api.post(`${API_BASE}/google-login`, 
        { token },
        {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          withCredentials: true,
          timeout: 10000
        }
      );

      if (!response.data?.token) throw new Error('Invalid server response - missing token');

      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      const userData = response.data.data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      let errorMessage = 'Google login failed';

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message;
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

      if (data.data.user?.isVerified === false) {
        setOtpEmail(userData.email);
        return { success: true, requiresVerification: true, email: userData.email };
      }

      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      const registeredUser = data.data.user;
      setUser(registeredUser);
      return { success: true, user: registeredUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post(`${API_BASE}/verifyEmailOTP`, { email, otp });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      const verifiedUser = { ...data.data.user, token: data.token };
      setUser(verifiedUser);
      setOtpEmail(null);

      return { success: true, user: verifiedUser };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      setError(message);
      if (message.includes('expired')) return { expired: true, email };
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (emailData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/resendEmailOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');

      return { success: true, message: data.message, email: data.email };
    } catch (err) {
      setError(err.message);
      return { success: false };
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
    role: user?.role || null,
    loading,
    error,
    otpEmail,
    isAdmin: checkAdminAccess(),
    login,
    googleLogin,
    register,
    verifyOTP,
    resendOTP,
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
