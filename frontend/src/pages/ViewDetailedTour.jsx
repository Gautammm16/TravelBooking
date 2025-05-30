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
  Loader2,
  Mountain,
  Leaf,
  Umbrella,
  Map,
  Compass,
  Coffee,
  Sunrise
} from 'lucide-react';

const ViewDetailedTour = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('highlights');

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:5000/api/v1/tours/${id}`);
        setTour(res.data.data.tour);
      } catch (error) {
        console.error('Error fetching tour:', error);
      } finally {
        setIsLoading(false);
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
    
    navigate('/payment', {
      state: {
        tourId: id,
        tourName: tour.name,
        price: tour.price,
        imageCover: tour.imageCover,
        duration: tour.duration,
        startDates: tour.startDates
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return <Compass className="text-green-500" size={20} />;
      case 'medium':
        return <Map className="text-yellow-500" size={20} />;
      case 'difficult':
        return <Mountain className="text-red-500" size={20} />;
      default:
        return <Compass className="text-blue-500" size={20} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-700 text-xl">Tour not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tour Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {tour.name} 
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <Globe className="text-blue-500 mr-2" size={18} /> 
              {tour.startLocation?.description || 'Himalayan Adventure'}
            </p>
          </div>
          <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full">
            <Star className="text-yellow-400 mr-2" size={18} />
            <span className="font-medium">{tour.ratingsAverage?.toFixed(1) || '4.5'}</span>
            <span className="text-gray-500 ml-1">({tour.ratingsQuantity || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Image Gallery - Kept exactly the same as original */}
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

      {/* Image Modal Carousel - Kept exactly the same as original */}
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

      {/* Tour Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 md:col-span-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tour Overview</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">{tour.summary}</p>
            
            {tour.description && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Detailed Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{tour.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 border-t border-b border-gray-200 py-5 my-6">
              <button 
                onClick={() => setActiveTab('highlights')}
                className={`flex items-center px-4 py-2 rounded-full transition ${activeTab === 'highlights' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Home size={18} className="mr-2" /> Highlights
              </button>
              <button 
                onClick={() => setActiveTab('itinerary')}
                className={`flex items-center px-4 py-2 rounded-full transition ${activeTab === 'itinerary' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <MapPin size={18} className="mr-2" /> Itinerary
              </button>
              <button 
                onClick={() => setActiveTab('included')}
                className={`flex items-center px-4 py-2 rounded-full transition ${activeTab === 'included' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <CheckCircle size={18} className="mr-2" /> What's Included
              </button>
            </div>

            {activeTab === 'highlights' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Tour Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.locations?.map((location, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          {index % 3 === 0 ? <Sunrise className="text-blue-600" size={18} /> : 
                           index % 3 === 1 ? <Coffee className="text-orange-500" size={18} /> : 
                           <Compass className="text-green-500" size={18} />}
                        </div>
                        <h4 className="font-medium text-gray-800">Day {location.day}: {location.description}</h4>
                      </div>
                      <p className="text-gray-600 text-sm ml-11">
                        Explore the {location.description.toLowerCase()} with our expert guides
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Daily Itinerary</h3>
                <div className="space-y-4">
                  {tour.locations?.map((location, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Day {location.day}: {location.description}</h4>
                        <p className="text-gray-600 mt-1">
                          {index === 0 ? 
                            "Arrival and orientation. " + location.description :
                            "Full day exploring " + location.description.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'included' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-3" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800">Accommodation</h4>
                      <p className="text-gray-600">Comfortable {tour.difficulty}-level appropriate lodging</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-3" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800">Professional Guides</h4>
                      <p className="text-gray-600">Certified local guides with extensive knowledge</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-3" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800">Transportation</h4>
                      <p className="text-gray-600">All transfers during the tour</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mt-1 mr-3" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800">Meals</h4>
                      <p className="text-gray-600">Breakfast included daily, some lunches and dinners</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-xl mb-4">Tour Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-3" size={18} />
                  <span>Duration</span>
                </div>
                <span className="font-medium">{tour.duration} days</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Users className="mr-3" size={18} />
                  <span>Group Size</span>
                </div>
                <span className="font-medium">Max {tour.maxGroupSize} people</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  {getDifficultyIcon(tour.difficulty)}
                  <span className="ml-3">Difficulty</span>
                </div>
                <span className="font-medium capitalize">{tour.difficulty}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Globe className="mr-3" size={18} />
                  <span>Location</span>
                </div>
                <span className="font-medium">{tour.country}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-xl mb-4">Available Dates</h3>
            <div className="space-y-3">
              {tour.startDates?.map((date, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="text-blue-500 mr-3" size={18} />
                    <span className="font-medium">{formatDate(date)}</span>
                  </div>
                  <span className="text-sm text-gray-500">Available</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xl">Tour Price</h3>
              <div className="text-2xl font-bold text-blue-600">
                ${tour.price}
                {tour.priceDiscount && (
                  <span className="text-sm text-gray-500 line-through ml-2">${tour.priceDiscount}</span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-4">Per person, includes all taxes and fees</p>
            <button 
              onClick={handleBookNowClick}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-600 transition flex items-center justify-center"
            >
              Book Now <ArrowRight className="ml-2" size={18} />
            </button>
            <p className="text-gray-500 text-sm mt-3 text-center">
              Free cancellation up to 30 days before tour
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailedTour;