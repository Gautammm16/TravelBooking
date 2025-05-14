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
  
  console.log('Total tours:', filteredTours.length);

  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const startIndex = (currentPage - 1) * toursPerPage;
  const currentTours = filteredTours.slice(startIndex, startIndex + toursPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Tours</h2>
          <input
            type="text"
            placeholder="Search tours..."
            className="border p-2 rounded w-64"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
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
            <div className="overflow-x-auto  border-b border">
              <table className="min-w-full bg-white rounded shadow">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Difficulty</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTours.map(tour => (
                    <tr key={tour._id} className="border-t">
                      <td className="px-6 py-4">{tour.name}</td>
                      <td className="px-6 py-4">${tour.price}</td>
                      <td className="px-6 py-4 capitalize">{tour.difficulty}</td>
                      <td className="px-6 py-4 flex space-x-4">
                        <Link
                          to={`/admin/update-tour/${tour._id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(tour._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded ${
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
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminManageTours;
