import { useState } from 'react'
import { forgotPassword, resetPassword } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState(1)

  const handleSendToken = async () => {
    await forgotPassword(email)
    setStep(2)
  }

  const handlePasswordReset = async () => {
    await resetPassword(resetToken, newPassword)
    setStep(3)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {step === 1 && (
        <div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleSendToken}>Send Reset Link</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <input
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            placeholder="Enter reset token"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />
          <button onClick={handlePasswordReset}>Reset Password</button>
        </div>
      )}

      {step === 3 && (
        <div>
          Password reset successful! Please login.
        </div>
      )}
    </div>
  )
}