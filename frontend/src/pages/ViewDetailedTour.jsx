import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ViewDetailedTour = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/tours/${id}`);
        setTour(res.data.data.tour);
      } catch (error) {
        console.error('Error fetching tour:', error);
      }
    };
    fetchTour();
  }, [id]);

  if (!tour) {
    return <div className="text-center mt-20 text-gray-700">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <img
        src={tour.imageCover}
        alt={tour.name}
        className="w-full h-64 object-cover rounded"
      />
      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.name}</h1>
        <p className="text-gray-600 mb-4">{tour.summary}</p>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Duration:</strong> {tour.duration} days</p>
          <p><strong>Group Size:</strong> {tour.maxGroupSize}</p>
          <p><strong>Difficulty:</strong> {tour.difficulty}</p>
          <p><strong>Ratings:</strong> {tour.ratingsAverage} ({tour.ratingsQuantity} reviews)</p>
          <p><strong>Country:</strong> {tour.country}</p>
          <p><strong>Description:</strong> {tour.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailedTour;
