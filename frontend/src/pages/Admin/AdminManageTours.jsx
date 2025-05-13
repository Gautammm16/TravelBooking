import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import { TrashIcon, PencilIcon } from '@heroicons/react/outline';
import AdminNavbar from "../../components/admin/AdminNavbar.jsx"


const AdminManageTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const { data } = await api.get('/api/v1/tours');
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
        await api.delete(`/api/v1/tours/${tourId}`);
        setTours(tours.filter(tour => tour._id !== tourId));
      } catch (err) {
        alert('Error deleting tour: ' + err.message);
      }
    }
  };

  const filteredTours = tours.filter(tour =>
    tour.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <AdminNavbar/>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Tours</h2>
        <input
          type="text"
          placeholder="Search tours..."
          className="border p-2 rounded w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="overflow-x-auto">
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
              {filteredTours.map(tour => (
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
      )}
    </div>
    </>
  );
};

export default AdminManageTours;
