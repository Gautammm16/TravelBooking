import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();
  const email = location.state?.email;

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || otp.length !== 6) {
    return setError('Please enter a valid 6-digit OTP');
  }

  setLoading(true);
  setError('');
  setMessage('');
  
  try {
    const response = await verifyOTP(email, otp); // Pass as separate args
    
    if (response.success)
       {
        navigate('/');
      alert('Email verified successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } else if (response.expired) {
      setError('OTP expired. Please request a new one.');
      setCountdown(0); // Enable resend immediately
    }
  } catch (err) {
    setError(err.message);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(''), 5000);
  } finally {
    setLoading(false);
  }
};

// const handleResendOTP = async () => {
//   if (countdown > 0) return;
  
//   setLoading(true);
//   setError('');
//   setMessage('');

//   try {
//     const response = await resendOTP({ email });
    
//     if (response.success) {
//       setMessage(response.message || 'New OTP sent to your email!');
//       setCountdown(60); // Start 60-second countdown
//       // Update email in case it changed (shouldn't happen but good practice)
//       if (response.email) setOtpEmail(response.email);
//     }
//   } catch (err) {
//     setError(err.message);
//     // Handle specific error cases
//     if (err.message.includes('already verified')) {
//       navigate('/login');
//     }
//   } finally {
//     setLoading(false);
//   }
// };

const handleResendOTP = async () => {
  if (countdown > 0) return;
  
  setLoading(true);
  setError('');
  setMessage('');

  try {
    const response = await resendOTP({ email });
    
    if (response.success) {
      setMessage('New OTP sent! Check your email.');
      setCountdown(60);
    }
  } catch (err) {
    setError(err.message);
    
    // Handle specific cases
    if (err.message.includes('already verified')) {
      navigate('/login');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Email</h2>
        <p className="text-center mb-4">We've sent a 6-digit code to {email}</p>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {message && <p className="text-green-500 mb-4 text-center">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                value={otp[i] || ''}
                onChange={(e) => {
                  const newOtp = otp.split('');
                  newOtp[i] = e.target.value.replace(/\D/g, '');
                  setOtp(newOtp.join(''));
                  
                  // Auto focus to next input
                  if (e.target.value && i < 5) {
                    document.getElementById(`otp-${i+1}`).focus();
                  }
                }}
                id={`otp-${i}`}
                className="w-12 h-12 text-2xl text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ))}
          </div>
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading || otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendOTP}
            disabled={loading}
            className="text-blue-500 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Didn't receive code? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;