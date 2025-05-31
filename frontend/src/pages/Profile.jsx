import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMe, updateUserData } from '../services/api';
import { ThreeDots } from 'react-loader-spinner';

const UserProfile = () => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMe();
        if (response.status === 'success') {
          setUser(response.data.user);
          setFormData({
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            gender: response.data.user.gender || '',
            phoneNumber: response.data.user.phoneNumber || '',
            dob: response.data.user.dob || '',
            preferences: {
              preferredLanguage: response.data.user.preferences?.preferredLanguage || '',
              currency: response.data.user.preferences?.currency || ''
            }
          });
          setError('');
        } else {
          setError(response.message || 'Failed to load profile data');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          logout();
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserData();
    } else {
      setLoading(false);
      setError('You are not logged in.');
    }
  }, [authUser, logout]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();

      // Append only the allowed fields
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('gender', formData.gender);
      form.append('phoneNumber', formData.phoneNumber);
      form.append('dob', formData.dob);
      form.append('preferences', JSON.stringify({
        preferredLanguage: formData.preferences?.preferredLanguage,
        currency: formData.preferences?.currency
      }));

      const res = await updateUserData(authUser._id, form);
      if (res.status === 'success') {
        setUser(res.data.user);
        setEditMode(false);
        setError('');
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots color="#3b82f6" height={80} width={80} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'No user data available.'}</p>
          {error.includes('Session expired') && (
            <button
              onClick={() => (window.location.href = '/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-white flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar || 'https://via.placeholder.com/80'}
                alt="Profile"
                className="h-20 w-20 rounded-full border-4 border-white object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">
                  {user.firstName || ''} {user.lastName || ''}
                </h1>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
            <div>
              <button
                onClick={() => setEditMode(prev => !prev)}
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-blue-100"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="px-6 py-8 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {['firstName', 'lastName', 'gender', 'phoneNumber'].map((field) => (
                  <div key={field}>
                    <p className="text-sm text-gray-500">{field.replace(/([A-Z])/g, ' $1')}</p>
                    {editMode ? (
                      <input
                        type="text"
                        name={field}
                        value={formData[field] || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-1"
                      />
                    ) : (
                      <p className="text-gray-800">{user[field] || 'Not specified'}</p>
                    )}
                  </div>
                ))}
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  {editMode ? (
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob || ''}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-1"
                    />
                  ) : (
                    <p className="text-gray-800">{formatDate(user.dob)}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {['preferredLanguage', 'currency'].map((pref) => (
                  <div key={pref}>
                    <p className="text-sm text-gray-500">{pref.replace('preferred', '')}</p>
                    {editMode ? (
                      <input
                        type="text"
                        name={`preferences.${pref}`}
                        value={formData.preferences?.[pref] || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-1"
                      />
                    ) : (
                      <p className="text-gray-800">{user.preferences?.[pref] || 'Not specified'}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-6">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-gray-800">{formatDate(user.createdAt)}</p>
            </div>

            {editMode && (
              <div className="text-right">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;