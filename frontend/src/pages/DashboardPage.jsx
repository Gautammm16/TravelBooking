import React, { useState, useEffect } from 'react';
import API from '../services/api';

const DashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get('/bookings/my-bookings');
        setBookings(data.data.bookings);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await API.delete(`/bookings/${bookingId}`);
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Your Dashboard</h1>
      <h2>Your Bookings</h2>
      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p>{error}</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <h3>{booking.tour.name}</h3>
              <p>Date: {new Date(booking.startDate).toLocaleDateString()}</p>
              <p>Participants: {booking.participants}</p>
              <p>Total: ${booking.price * booking.participants}</p>
              <button 
                onClick={() => handleCancel(booking._id)}
                className="btn btn-danger"
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;