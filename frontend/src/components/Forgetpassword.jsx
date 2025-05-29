import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword, verifyResetOTP, resetPasswordWithOTP } from '../services/api'
import { FiMail, FiKey, FiLock, FiCheck } from 'react-icons/fi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [resetToken, setResetToken] = useState('') // ✅ Added missing state
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    clearMessages()

    try {
      const response = await forgotPassword(email)
      setSuccess(response.message || 'OTP sent to your email successfully')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    setLoading(true)
    clearMessages()

    try {
      const response = await verifyResetOTP({ email, otp })

      if (response.resetToken) {
        setResetToken(response.resetToken)
      }

      setSuccess(response.message || 'OTP verified successfully')
      setStep(3)
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Invalid OTP. Please try again.'
      setError(errorMessage)

      if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('expired')) {
        setOtp('')
      }
    } finally {
      setLoading(false)
    }
  }



const handlePasswordReset = async (e) => {
  e.preventDefault();

  if (!newPassword || !passwordConfirm) {
    setError('Please fill in both password fields');
    return;
  }

  if (newPassword !== passwordConfirm) {
    setError('Passwords do not match');
    return;
  }

  if (newPassword.length < 8) {
    setError('Password must be at least 8 characters long');
    return;
  }

  setLoading(true);
  clearMessages();

  try {
    const response = await resetPasswordWithOTP({
      resetToken: resetToken,  // Match backend expectation
      newPassword,
      passwordConfirm  // Match backend expectation
    });
    
    setSuccess(response.message || 'Password reset successful! Please login with your new password.');
    setStep(4);

    setTimeout(() => {
      navigate('/login');
    }, 3000);
  } catch (err) {
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Failed to reset password. Please try again.';
    setError(errorMessage);
    
    if (errorMessage.toLowerCase().includes('invalid token')) {
      setStep(1);
      setResetToken('');
    }
  } finally {
    setLoading(false);
  }
};

  
  const handleResendOTP = async () => {
    setLoading(true)
    clearMessages()

    try {
      const response = await forgotPassword(email)
      setSuccess(response.message || 'New OTP sent to your email')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create your new password"}
            {step === 4 && "Password reset successful!"}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > stepNum ? <FiCheck size={16} /> : stepNum}
              </div>
            ))}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full py-2 px-4 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                Didn't receive OTP? Resend
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiCheck className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Password reset successful!</h3>
              <p className="text-sm text-gray-600">You will be redirected to login page shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
