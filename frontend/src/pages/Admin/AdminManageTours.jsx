import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import { TrashIcon, PencilIcon } from '@heroicons/react/outline';
import AdminNavbar from "../../components/admin/AdminNavbar.jsx";

const AdminManageTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 8;

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const { data } = await api.get('/v1/tours?page=1&limit=1000');
        setTours(data.data.tours);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleDelete = async (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        await api.delete(`/v1/tours/${tourId}`);
        setTours(tours.filter(tour => tour._id !== tourId));
      } catch (err) {
        alert('Error deleting tour: ' + err.message);
      }
    }
  };

  const filteredTours = tours.filter(tour =>
    tour.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const startIndex = (currentPage - 1) * toursPerPage;
  const currentTours = filteredTours.slice(startIndex, startIndex + toursPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Manage Tours</h2>
          <input
            type="text"
            placeholder="Search tours..."
            className="border p-2 rounded w-full md:w-64"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center mt-8">
            <ThreeDots
              height="50"
              width="50"
              radius="9"
              color="#3b82f6"
              ariaLabel="three-dots-loading"
              visible={true}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-lg shadow">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentTours.length > 0 ? (
                    currentTours.map(tour => (
                      <tr key={tour._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm md:text-base">
                          <div className="text-gray-900 font-medium">{tour.name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm md:text-base">
                          <div className="text-gray-900">${tour.price}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm md:text-base">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            tour.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            tour.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tour.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm md:text-base">
                          <div className="flex space-x-2 md:space-x-4">
                            <Link
                              to={`/admin/update-tour/${tour._id}`}
                              className="text-blue-500 hover:text-blue-700"
                              aria-label="Edit tour"
                            >
                              <PencilIcon className="h-4 w-4 md:h-5 md:w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(tour._id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Delete tour"
                            >
                              <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                        No tours found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center mt-6 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminManageTours;