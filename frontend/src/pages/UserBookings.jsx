import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import api from '../services/api';
// import defaultTourImage from '../../assets/default-tour.jpg';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const { data } = await api.get('/v1/bookings/my-bookings');
        setBookings(data.data.bookings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.message || 'Failed to load bookings');
        setLoading(false);
        
        // Redirect to login if unauthorized
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      // Update booking status to 'cancelled'
      await api.patch(`/v1/bookings/${bookingId}`, { status: 'cancelled' });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
      ));
      
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ThreeDots 
          height="50" 
          width="50" 
          color="#3b82f6" 
          ariaLabel="loading" 
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <p className="text-lg">You haven't made any bookings yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Browse Tours
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => (
            <div 
              key={booking._id} 
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={booking.tour?.imageCover }
                  alt={booking.tour?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white">{booking.tour?.name}</h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(booking.startDate)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Duration:</span>
                  <span>{booking.tour?.duration} days</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Price:</span>
                  <span>${booking.price}</span>
                </div>
                
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="flex justify-end">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;