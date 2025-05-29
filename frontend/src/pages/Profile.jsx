
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api';
import { ThreeDots } from 'react-loader-spinner';

const UserProfile = () => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMe();
        if (response.status === 'success') {
          setUser(response.data.user);
          setError('');
        } else {
          setError(response.message || 'Failed to load profile data');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response) {
          if (err.response.status === 401) {
            setError('Session expired. Please log in again.');
            logout(); // Optional: automatically log out user
          } else if (err.response.data?.message) {
            setError(err.response.data.message);
          } else {
            setError('Failed to load profile data');
          }
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
      day: 'numeric'
    });
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
              onClick={() => window.location.href = '/login'}
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
          <div className="bg-blue-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar || 'https://via.placeholder.com/80'}
                alt="Profile"
                className="h-20 w-20 rounded-full border-4 border-white"
              />
              <div>
                <h1 className="text-2xl font-bold">
                  {user.firstName || ''} {user.lastName || ''}
                </h1>
                <p className="text-blue-100">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-blue-800 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Personal Information
                </h2>
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="text-gray-800">{user.firstName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="text-gray-800">{user.lastName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-800">{formatDate(user.dob)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-800">
                    {user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Contact Information
                </h2>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-800">{user.phoneNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="text-gray-800">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Address */}
              {user.address && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Address</h2>
                  {['street', 'city', 'state', 'country', 'zipCode'].map(field => (
                    <div key={field}>
                      <p className="text-sm text-gray-500">{field.charAt(0).toUpperCase() + field.slice(1)}</p>
                      <p className="text-gray-800">{user.address[field] || 'Not specified'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Preferences */}
              {user.preferences && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Preferences</h2>
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <p className="text-gray-800">{user.preferences.preferredLanguage || 'English'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="text-gray-800">{user.preferences.currency || 'USD'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Newsletter</p>
                    <p className="text-gray-800">{user.preferences.newsletter ? 'Subscribed' : 'Not Subscribed'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media */}
            {user.socialMedia && (
              <div className="mt-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Social Media</h2>
                <p className="text-sm text-gray-500">
                  {user.socialMedia.googleId ? 'Connected with Google' : 'Not connected to Google'}
                </p>
              </div>
            )}

            {/* Created At */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-gray-800">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;