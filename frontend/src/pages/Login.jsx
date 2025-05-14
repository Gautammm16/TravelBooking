import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(''); // Added local error state
  const { login, googleLogin, error, loading, user } = useAuth();
 
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from]);

  // Handle regular email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLocalError(''); // Clear previous errors
      await login(email, password);
     
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err.message || 'Login failed');
     
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Verify we got a credential
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      
      setLocalError(''); // Clear previous errors
      await googleLogin(credentialResponse);
    } catch (err) {
      console.error('Google login error:', err);
      
      // Handle specific errors
      if (err.message.includes('popup_closed')) {
        setLocalError('Login window was closed - please try again');
      } else if (err.message.includes('No credential')) {
        setLocalError('Google login failed - no credential received');
      } else {
        setLocalError(err.message || 'Google login failed');
      }
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    setLocalError('Google login failed - please try another method');
  };

  // Combine context error and local error for display
  const displayError = error || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {displayError && <p className="text-red-500 mb-4">{displayError}</p>}
        
        {/* Email/Password Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300">
          <p className="mx-4 mb-0 text-center font-semibold text-gray-500">OR</p>
        </div>

        {/* Google Sign-In Button */}
        <div className="flex justify-center mb-4">
          <GoogleOAuthProvider clientId="1058688869753-ug32b220q6n20fb53gca9ah4ie84q6st.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
              shape="pill"
              size="large"
              text="continue_with"
            />
          </GoogleOAuthProvider>
        </div>
        
        {/* Additional Links */}
        <p className="mt-4 text-center">
          Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
        </p>
        <p className="mt-2 text-center">
          Forgot password? <a href="/forget-password" className="text-blue-500 hover:underline">Reset Password</a>
        </p>
      </div>
    </div>
  );
};

export default Login;