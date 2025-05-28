import React, { useState, useEffect } from 'react';
import { Mail, Shield, Eye, EyeOff, User, Phone, Calendar, MapPin, CheckCircle } from 'lucide-react';

const OTPVerificationSystem = () => {
  const [currentView, setCurrentView] = useState('register');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Form states
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    dob: '',
    gender: ''
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [otpData, setOtpData] = useState({
    email: '',
    otp: ''
  });

  const [resetData, setResetData] = useState({
    email: '',
    otp: '',
    password: '',
    passwordConfirm: '',
    resetToken: ''
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (formType, field, value) => {
    const setters = {
      register: setRegisterData,
      login: setLoginData,
      otp: setOtpData,
      reset: setResetData
    };
    
    setters[formType](prev => ({ ...prev, [field]: value }));
    setError('');
    setMessage('');
  };

  const apiCall = async (endpoint, data, method = 'POST') => {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await apiCall('register', registerData);
      setMessage('Registration successful! Please check your email for verification OTP.');
      setOtpData(prev => ({ ...prev, email: registerData.email }));
      setCurrentView('verify-email');
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('login', loginData);
      setMessage('Login successful!');
      // Store token and redirect
      localStorage.setItem('token', result.token);
      // Redirect to dashboard or home page
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
      if (err.message.includes('verify your email')) {
        setOtpData(prev => ({ ...prev, email: loginData.email }));
        setCurrentView('verify-email');
        setCountdown(60);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('verifyEmailOTP', otpData);
      setMessage('Email verified successfully! You can now login.');
      setCurrentView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('resendEmailOTP', { email: otpData.email });
      setMessage('New OTP sent to your email!');
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('forgotPassword', { email: resetData.email });
      setMessage('Password reset OTP sent to your email!');
      setCurrentView('verify-reset-otp');
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('resetPassword', {
        email: resetData.email,
        otp: resetData.otp,
        newPassword: resetData.password
      });
      setMessage('Password reset successfully! You can now login with your new password.');
      setCurrentView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('resetPassword', {
        email: resetData.email,
        otp: resetData.otp,
        newPassword: resetData.password
      });
      setMessage('Password reset successfully! You can now login with your new password.');
      setCurrentView('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterForm = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <User className="mx-auto h-12 w-12 text-blue-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600">Join us today</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={registerData.firstName}
            onChange={(e) => handleInputChange('register', 'firstName', e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={registerData.lastName}
            onChange={(e) => handleInputChange('register', 'lastName', e.target.value)}
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={registerData.email}
          onChange={(e) => handleInputChange('register', 'email', e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={registerData.phoneNumber}
          onChange={(e) => handleInputChange('register', 'phoneNumber', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={registerData.dob}
            onChange={(e) => handleInputChange('register', 'dob', e.target.value)}
          />
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={registerData.gender}
            onChange={(e) => handleInputChange('register', 'gender', e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={registerData.password}
            onChange={(e) => handleInputChange('register', 'password', e.target.value)}
            required
            minLength="8"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={registerData.passwordConfirm}
          onChange={(e) => handleInputChange('register', 'passwordConfirm', e.target.value)}
          required
          minLength="8"
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setCurrentView('login')}
          className="text-blue-600 hover:underline"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={loginData.email}
          onChange={(e) => handleInputChange('login', 'email', e.target.value)}
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={loginData.password}
            onChange={(e) => handleInputChange('login', 'password', e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center mt-4 space-y-2">
        <button
          onClick={() => setCurrentView('forgot-password')}
          className="text-blue-600 hover:underline block"
        >
          Forgot Password?
        </button>
        <button
          onClick={() => setCurrentView('register')}
          className="text-blue-600 hover:underline"
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );

  const renderOTPVerification = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <Mail className="mx-auto h-12 w-12 text-green-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600">Enter the 6-digit code sent to</p>
        <p className="text-blue-600 font-medium">{otpData.email}</p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={otpData.otp[i] || ''}
              onChange={(e) => {
                const newOtp = otpData.otp.split('');
                newOtp[i] = e.target.value.replace(/\D/g, '');
                handleInputChange('otp', 'otp', newOtp.join(''));
                
                // Auto focus to next input
                if (e.target.value && i < 5) {
                  document.getElementById(`otp-${i+1}`).focus();
                }
              }}
              id={`otp-${i}`}
              required
            />
          ))}
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}

        <button
          type="submit"
          disabled={loading || otpData.otp.length < 6}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={handleResendOTP}
          disabled={countdown > 0 || loading}
          className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </button>
      </div>

      <div className="text-center mt-2">
        <button
          onClick={() => setCurrentView('login')}
          className="text-gray-600 hover:underline text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  const renderForgotPassword = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <Shield className="mx-auto h-12 w-12 text-orange-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600">Enter your email to receive reset code</p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          value={resetData.email}
          onChange={(e) => handleInputChange('reset', 'email', e.target.value)}
          required
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setCurrentView('login')}
          className="text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  const renderVerifyResetOTP = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <Shield className="mx-auto h-12 w-12 text-orange-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Verify Reset Code</h2>
        <p className="text-gray-600">Enter the code sent to</p>
        <p className="text-orange-600 font-medium">{resetData.email}</p>
      </div>

      <form onSubmit={handleVerifyResetOTP} className="space-y-4">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={resetData.otp[i] || ''}
              onChange={(e) => {
                const newOtp = resetData.otp.split('');
                newOtp[i] = e.target.value.replace(/\D/g, '');
                handleInputChange('reset', 'otp', newOtp.join(''));
                
                // Auto focus to next input
                if (e.target.value && i < 5) {
                  document.getElementById(`reset-otp-${i+1}`).focus();
                }
              }}
              id={`reset-otp-${i}`}
              required
            />
          ))}
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}

        <button
          type="submit"
          disabled={loading || resetData.otp.length < 6}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setCurrentView('forgot-password')}
          className="text-blue-600 hover:underline"
        >
          Back to Reset Request
        </button>
      </div>
    </div>
  );

  const renderResetPassword = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <Shield className="mx-auto h-12 w-12 text-green-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
        <p className="text-gray-600">Create a new password for your account</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={resetData.password}
            onChange={(e) => handleInputChange('reset', 'password', e.target.value)}
            required
            minLength="8"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={resetData.passwordConfirm}
          onChange={(e) => handleInputChange('reset', 'passwordConfirm', e.target.value)}
          required
          minLength="8"
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );

  const renderSuccessView = () => (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <div className="mb-6">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
        <p className="text-gray-600 mt-2">{message}</p>
      </div>
      <button
        onClick={() => {
          setCurrentView('login');
          setMessage('');
        }}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Continue to Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {currentView === 'register' && renderRegisterForm()}
        {currentView === 'login' && renderLoginForm()}
        {currentView === 'verify-email' && renderOTPVerification()}
        {currentView === 'forgot-password' && renderForgotPassword()}
        {currentView === 'verify-reset-otp' && renderVerifyResetOTP()}
        {currentView === 'reset-password' && renderResetPassword()}
        {currentView === 'success' && renderSuccessView()}
      </div>
    </div>
  );
};

export default OTPVerificationSystem;