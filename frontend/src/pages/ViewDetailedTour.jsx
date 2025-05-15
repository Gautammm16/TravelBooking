import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar, 
  Globe, 
  Home, 
  Tag,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';

const ViewDetailedTour = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/tours/${id}`);
        setTour(res.data.data.tour);
        // Set the first available date as default selected
        if (res.data.data.tour.startDates?.length > 0) {
          setSelectedDate(res.data.data.tour.startDates[0]);
        }
      } catch (error) {
        console.error('Error fetching tour:', error);
      }
    };
    fetchTour();
  }, [id]);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const nextImage = () => {
    if (tour?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % (tour.images.length + 1));
    }
  };

  const prevImage = () => {
    if (tour?.images?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? tour.images.length : prev - 1
      );
    }
  };

  const handleBookNowClick = () => {
    if (!user) {
      alert('You must be logged in to book a tour.');
      navigate('/login', { state: { from: `/tour/${id}` } });
      return;
    }
    setIsBookingModalOpen(true);
  };

const handleConfirmBooking = async () => {
  if (!selectedDate) {
    setError('Please select a date');
    return;
  }

  if (!participants || participants < 1) { // Add participants validation
    setError('Please select at least 1 participant');
    return;
  }

  setIsLoading(true);
  setError(null);
  
  // Get the token from localStorage as a fallback if not in user object
  const token = user?.token || localStorage.getItem('token');
  
  if (!token) {
    setError('Authentication token not found. Please log in again.');
    setIsLoading(false);
    return;
  }
  
  try {
    const res = await axios.post(
      'http://localhost:5000/api/v1/bookings',
      {
        tour: id,
        price: tour.price * participants, // Calculate total price
        paymentMethod: 'credit-card', // Or get this from user selection
        participants: participants,
        startDate: selectedDate
        // Remove user: user.id - this comes from the token
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (res.data.status === 'success') {
      setBookingSuccess(true);
    }
  } catch (err) {
    console.error('Booking error:', err);
    
    // More detailed error handling
    if (err.response) {
      // Server responded with error status code
      if (err.response.data?.message) {
        setError(err.response.data.message);
      } else if (err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Booking failed. Please check your details and try again.');
      }
      
      // Handle specific status codes
      if (err.response.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login', { state: { from: `/tour/${id}` } });
      }
    } else if (err.request) {
      // Request was made but no response received
      setError('Network error. Please check your connection.');
    } else {
      // Something else happened
      setError('An unexpected error occurred. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  if (!tour) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-700 text-xl">Loading tour details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-50">
      {/* Tour Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {tour.name} 
        </h1>
        <p className="text-gray-600 mt-2 flex items-center">
          <Globe size={18} className="mr-2" /> 
          Tour with {tour.difficulty} difficulty, {tour.maxGroupSize} max group size & {tour.duration} days adventure
        </p>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 md:col-span-7 relative">
          <img
            src={tour.imageCover}
            alt={tour.name}
            className="w-full h-80 object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
            onClick={() => openModal(0)}
          />
        </div>
        
        <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-4">
          {tour.images.slice(0, 4).map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img}
                alt={`${tour.name} ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
                onClick={() => openModal(index + 1)}
              />
              {index === 3 && tour.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg cursor-pointer">
                  <span className="text-white text-lg font-semibold">+{tour.images.length - 4} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal Carousel */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0">
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white hover:text-gray-300 transition">
            <X size={28} />
          </button>
          <button onClick={prevImage} className="absolute left-6 text-white hover:text-gray-300 transition">
            <ChevronLeft size={40} />
          </button>
          <img
            src={currentImageIndex === 0 ? tour.imageCover : tour.images[currentImageIndex - 1]}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
          <button onClick={nextImage} className="absolute right-6 text-white hover:text-gray-300 transition">
            <ChevronRight size={40} />
          </button>
          <div className="absolute bottom-6 text-white text-sm bg-black/60 py-1 px-4 rounded-full">
            {currentImageIndex + 1} / {tour.images.length + 1}
          </div>
        </div>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} className="fixed z-50 inset-0">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {bookingSuccess ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">Your tour has been successfully booked.</p>
                <button
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    navigate('/my-bookings');
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full"
                >
                  View My Bookings
                </button>
              </div>
            ) : (
              <>
                <Dialog.Title className="text-xl font-bold mb-4">Book {tour.name}</Dialog.Title>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Select Date</label>
                    <div className="grid grid-cols-2 gap-2">
                      {tour.startDates?.map((date, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(date)}
                          className={`p-2 rounded text-center ${selectedDate === date ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
                        >
                          {formatDate(date)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div>
                      <p className="text-gray-500">Total Price</p>
                      <p className="text-2xl font-bold">${tour.price}</p>
                    </div>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center disabled:bg-blue-400"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          Processing...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>

      {/* Tour Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 md:col-span-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-lg text-gray-700 mb-4">{tour.summary}</p>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Enjoy a choice of {tour.difficulty} level hiking trails, 
                a free guide to popular locations, adventure-friendly amenities and more at {tour.name}.
                <span className="text-blue-500 font-medium ml-1 cursor-pointer">More</span>
              </p>
            </div>

            <div className="flex flex-wrap border-t border-b border-gray-200 py-4 my-4">
              <button className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-full mr-4">
                <Home size={18} className="mr-2" /> Tour Highlights
              </button>
              <button className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                <MapPin size={18} className="mr-2" /> Location & Surroundings
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Why book this tour?</h2>
              <div className="mb-6">
                <div className="flex items-start mb-4">
                  <MapPin size={24} className="text-gray-500 mt-1 mr-4" />
                  <div>
                    <h3 className="font-medium">Top Nearby Attractions</h3>
                    <p className="text-gray-600">
                      Have fun exploring {tour.locations?.map(loc => loc.description).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start mb-4">
                  <Tag size={24} className="text-gray-500 mt-1 mr-4" />
                  <div>
                    <h3 className="font-medium">Tour Experience</h3>
                    <p className="text-gray-600">
                      {tour.difficulty} level tour with professional guides and {tour.maxGroupSize} maximum group size
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar size={24} className="text-gray-500 mt-1 mr-4" />
                  <div>
                    <h3 className="font-medium">Tour Schedule</h3>
                    <p className="text-gray-600">
                      {tour.duration} days tour with well-planned itinerary and comfortable transportation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Tour Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-xl">
                {tour.ratingsAverage}
              </div>
              <div>
                <div className="font-semibold text-lg">Very Good</div>
                <div className="text-gray-500 text-sm">{tour.ratingsQuantity} ratings</div>
              </div>
              <div className="text-blue-600 underline cursor-pointer">All Reviews</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Tour Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Clock className="text-gray-500 mr-3" size={18} />
                  <span>Duration</span>
                </div>
                <span className="font-medium">{tour.duration} days</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Users className="text-gray-500 mr-3" size={18} />
                  <span>Group Size</span>
                </div>
                <span className="font-medium">Max {tour.maxGroupSize} people</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Star className="text-gray-500 mr-3" size={18} />
                  <span>Difficulty</span>
                </div>
                <span className="font-medium capitalize">{tour.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <MapPin className="text-gray-500 mr-3" size={18} />
                  <span>Country</span>
                </div>
                <span className="font-medium">{tour.country}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold mb-2">Start Dates:</div>
                <div className="grid grid-cols-2 gap-2">
                  {tour.startDates?.slice(0, 4).map((date, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded text-center">
                      {formatDate(date)}
                    </div>
                  ))}
                  {tour.startDates?.length > 4 && (
                    <div className="bg-gray-100 p-2 rounded text-center text-blue-600">
                      +{tour.startDates.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">Price</h3>
            <div className="flex items-center justify-between mb-4">
              <p>{tour.dis}</p>
              <span className="text-2xl font-bold text-green-600">${tour.price}</span>
              <button 
                onClick={handleBookNowClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                Book Now <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
            <p className="text-gray-500 text-sm">Includes accommodation, transport, and guided tour</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailedTour;