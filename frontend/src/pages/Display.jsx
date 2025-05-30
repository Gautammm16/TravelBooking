import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, HeartOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Display = () => {
  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({});
  const [favorites, setFavorites] = useState([]);

  const toursPerPage = 8;
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const fetchAllTours = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/tours?limit=1000');
      const tours = res.data.data?.tours || res.data.tours || [];
      setAllTours(tours);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setAllTours([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!token || !user) {
      setFavorites([]);
      return;
    }
    
    try {
      setFavoritesLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle different response structures
      let favoriteIds = [];
      if (res.data.data?.favorites) {
        favoriteIds = res.data.data.favorites.map(fav => 
          typeof fav === 'string' ? fav : fav._id || fav.tourId
        );
      } else if (res.data.favorites) {
        favoriteIds = res.data.favorites.map(fav => 
          typeof fav === 'string' ? fav : fav._id || fav.tourId
        );
      }
      
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Fetch tours on component mount
  useEffect(() => {
    fetchAllTours();
  }, []);

  // Fetch favorites when user or token changes
  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, token]);

  // Filter and sort tours
  useEffect(() => {
    let filtered = [...allTours];
    if (search.trim()) {
      filtered = filtered.filter(tour =>
        tour.name?.toLowerCase().includes(search.toLowerCase().trim())
      );
    }
    if (country.trim()) {
      filtered = filtered.filter(tour =>
        tour.country?.toLowerCase() === country.toLowerCase().trim()
      );
    }
    if (difficulty.trim()) {
      filtered = filtered.filter(tour =>
        tour.difficulty?.toLowerCase() === difficulty.toLowerCase().trim()
      );
    }
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    setFilteredTours(filtered);
    setCurrentPage(1);
  }, [search, country, difficulty, sortOrder, allTours]);

  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);

  const handleFavoriteToggle = async (tourId, e) => {
    e.stopPropagation();
    if (!user || !token) {
      alert('Please log in to favorite tours.');
      return;
    }

    const wasAlreadyFavorite = favorites.includes(tourId);

    try {
      // Optimistically update the UI
      if (wasAlreadyFavorite) {
        setFavorites(prev => prev.filter(id => id !== tourId));
      } else {
        setFavorites(prev => [...prev, tourId]);
      }

      let res;
      if (wasAlreadyFavorite) {
        res = await axios.delete(
          `http://localhost:5000/api/v1/favorites/${tourId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          'http://localhost:5000/api/v1/favorites',
          { tourId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update favorites from server response to ensure consistency
      let updatedFavorites = [];
      if (res.data.data?.favorites) {
        updatedFavorites = res.data.data.favorites.map(fav => 
          typeof fav === 'string' ? fav : fav._id || fav.tourId
        );
      } else if (res.data.favorites) {
        updatedFavorites = res.data.favorites.map(fav => 
          typeof fav === 'string' ? fav : fav._id || fav.tourId
        );
      }
      
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error('Error updating favorites:', err);
      
      // Revert optimistic update on error
      if (wasAlreadyFavorite) {
        setFavorites(prev => [...prev, tourId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== tourId));
      }
      
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleImageNavigation = (tourId, direction, length, e) => {
    e.stopPropagation();
    setImageIndexes(prev => {
      const currentIndex = prev[tourId] || 0;
      const newIndex = direction === 'prev'
        ? (currentIndex - 1 + length) % length
        : (currentIndex + 1) % length;
      return { ...prev, [tourId]: newIndex };
    });
  };

  const resetFilters = () => {
    setSearch('');
    setCountry('');
    setDifficulty('');
    setSortOrder('');
  };

  const uniqueCountries = [...new Set(allTours.map(t => t.country).filter(Boolean))];

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 md:px-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Explore Our Tours</h1>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tour..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-64 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">All Countries</option>
          {uniqueCountries.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="difficult">Difficult</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">Sort by Price</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
        <button
          onClick={resetFilters}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {currentTours.length > 0 ? (
              currentTours.map((tour) => {
                const images = Array.isArray(tour.images) && tour.images.length
                  ? tour.images
                  : tour.imageCover ? [tour.imageCover] : ['/placeholder-image.jpg'];

                const currentIndex = imageIndexes[tour._id] || 0;
                const isFavorite = favorites.includes(tour._id);

                return (
                  <div
                    key={tour._id}
                    onClick={() => navigate(`/tour/${tour._id}`)}
                    className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
                  >
                    <div className="relative w-full aspect-video bg-gray-200">
                      <img
                        src={images[currentIndex]}
                        alt={tour.name}
                        onError={(e) => e.target.src = '/placeholder-image.jpg'}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => handleImageNavigation(tour._id, 'prev', images.length, e)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-90 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-800" />
                          </button>
                          <button
                            onClick={(e) => handleImageNavigation(tour._id, 'next', images.length, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-90 transition-all"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-800" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, idx) => (
                              <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`} />
                            ))}
                          </div>
                        </>
                      )}
                      {user && (
                        <button
                          onClick={(e) => handleFavoriteToggle(tour._id, e)}
                          disabled={favoritesLoading}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                            isFavorite 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-white text-gray-800 hover:bg-gray-100'
                          } ${favoritesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isFavorite ? (
                            <Heart className="w-5 h-5 fill-current" />
                          ) : (
                            <HeartOff className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{tour.name}</h2>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tour.summary}</p>
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>📍 {tour.country}</span>
                        <span>⏱ {tour.duration} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-600">${tour.price}</span>
                        <span className="text-xs capitalize text-gray-500">{tour.difficulty}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 text-lg">No tours found matching your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 border rounded transition-colors ${
                    currentPage === index + 1 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 hover:bg-blue-100 border-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Display;