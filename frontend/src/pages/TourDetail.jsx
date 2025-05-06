import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

const TourDetailsPage = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    participants: 1,
    startDate: ''
  });

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const { data } = await API.get(`/tours/${id}`);
        setTour(data.data.tour);
      } catch (err) {
        setError('Tour not found');
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bookings', {
        tour: id,
        participants: bookingData.participants,
        startDate: bookingData.startDate
      });
      alert('Booking successful!');
    } catch (err) {
      alert('Booking failed: ' + err.response?.data?.message);
    }
  };

  if (loading) return <p>Loading tour details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tour-details">
      <h1>{tour.name}</h1>
      <p>{tour.description}</p>
      <div className="tour-info">
        <p>Duration: {tour.duration} days</p>
        <p>Price: ${tour.price}</p>
        <p>Difficulty: {tour.difficulty}</p>
      </div>

      <form onSubmit={handleBooking} className="booking-form">
        <h2>Book This Tour</h2>
        <label>
          Participants:
          <input
            type="number"
            value={bookingData.participants}
            onChange={e => setBookingData({...bookingData, participants: e.target.value})}
            min="1"
            max="10"
            required
          />
        </label>
        <label>
          Start Date:
          <input
            type="date"
            value={bookingData.startDate}
            onChange={e => setBookingData({...bookingData, startDate: e.target.value})}
            required
          />
        </label>
        <button type="submit" className="btn">Book Now</button>
      </form>
    </div>
  );
};

export default TourDetailsPage;