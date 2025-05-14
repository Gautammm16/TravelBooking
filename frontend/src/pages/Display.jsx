import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Display = () => {
  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({});

  const toursPerPage = 8;
  const navigate = useNavigate();

  const fetchAllTours = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/tours?limit=1000');
      const data = res.data;
      setAllTours(data.data.tours || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTours();
  }, []);

  useEffect(() => {
    let filtered = allTours;

    if (search) {
      filtered = filtered.filter(tour =>
        tour.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (country) {
      filtered = filtered.filter(tour =>
        tour.country.toLowerCase() === country.toLowerCase()
      );
    }

    if (difficulty) {
      filtered = filtered.filter(tour =>
        tour.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    setFilteredTours(filtered);
    setCurrentPage(1);
  }, [search, country, difficulty, sortOrder, allTours]);

  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);

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
          className="px-3 py-2 border rounded w-64 focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Countries</option>
          {[...new Set(allTours.map(t => t.country))].map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="difficult">Difficult</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Sort by Price</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>

        <button
          onClick={() => {
            setSearch('');
            setCountry('');
            setDifficulty('');
            setSortOrder('');
          }}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Tour Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {currentTours.length > 0 ? (
              currentTours.map((tour) => {
                const images = tour.images && tour.images.length > 0 ? tour.images : [tour.imageCover];
                const currentIndex = imageIndexes[tour._id] || 0;

                return (
                  <div
                    key={tour._id}
                    onClick={() => navigate(`/tour/${tour._id}`)}
                    className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Carousel */}
                    <div className="relative w-full aspect-video bg-gray-200">
                      <img
                        src={images[currentIndex]}
                        alt={tour.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      {/* Left Arrow */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageIndexes((prev) => ({
                                ...prev,
                                [tour._id]: (currentIndex - 1 + images.length) % images.length
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-90"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-800" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageIndexes((prev) => ({
                                ...prev,
                                [tour._id]: (currentIndex + 1) % images.length
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-90"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-800" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">{tour.name}</h2>
                      <p className="text-sm text-gray-600 mb-2">{tour.summary}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>📍 {tour.country}</span>
                        <span>⏱ {tour.duration} days</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>📆 Start Dates: {tour.startDates?.slice(0, 2).join(', ')}</span>
                      </div>
                      <div className="flex flex-col mt-1 text-sm text-gray-500">
                        {tour.locations?.slice(0, 2).map((loc, idx) => (
                          <span key={idx}>📌 {loc.description}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-bold text-green-600">₹{tour.price}</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{tour.difficulty}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 col-span-full">No tours found.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center flex-wrap gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Display;
