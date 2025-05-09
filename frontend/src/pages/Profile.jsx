import { useState, useEffect } from 'react'
import { updateUser, changePassword } from '../services/api'
import Loader from '../components/Loader'

export default function Profile({ user, setUser }) {
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    photo: user.photo
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const updatedUser = await updateUser(user._id, profileData, user.token)
      setUser(updatedUser)
      // ... show success notification
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // ... show error
      return
    }
    try {
      setLoading(true)
      await changePassword(user._id, passwordData, user.token)
      // ... show success and clear form
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('profile')}>Profile</button>
        <button onClick={() => setActiveTab('password')}>Password</button>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleProfileUpdate} className="max-w-md space-y-4">
          <div>
            <label>Name</label>
            <input
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>
          {/* Add photo upload input */}
          <button disabled={loading}>
            {loading ? <Loader /> : 'Update Profile'}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
          {/* Password fields */}
          <button disabled={loading}>
            {loading ? <Loader /> : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  )
}