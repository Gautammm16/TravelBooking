import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const { data } = await API.get('/tours');
        setTours(data.data.tours);
      } catch (err) {
        setError('Failed to load tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  return (
    <div className="tours-page">
      <h1>All Tours</h1>
      {loading ? (
        <p>Loading tours...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="tours-list">
          {tours.map(tour => (
            <div key={tour._id} className="tour-card">
              <h2>{tour.name}</h2>
              <p>Duration: {tour.duration} days</p>
              <p>Price: ${tour.price}</p>
              <Link to={`/tours/${tour._id}`} className="btn">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToursPage;