import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const { data } = await API.get('/tours?limit=3');
        setTours(data.data.tours);
      } catch (err) {
        setError('Failed to load featured tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Discover Amazing Tours</h1>
        <Link to="/tours" className="btn">Explore Tours</Link>
      </section>

      <section className="featured-tours">
        <h2>Featured Tours</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="tours-grid">
            {tours.map(tour => (
              <div key={tour._id} className="tour-card">
                <h3>{tour.name}</h3>
                <p>{tour.summary}</p>
                <Link to={`/tours/${tour._id}`} className="btn">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;