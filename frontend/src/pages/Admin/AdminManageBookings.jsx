import React, { useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import api from '../../services/api';

import AdminNavbar from "../../components/admin/AdminNavbar.jsx"

const AdminManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/api/v1/bookings');
        setBookings(data.data.bookings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/api/v1/bookings/${bookingId}`, { status: newStatus });
      setBookings(bookings.map(booking =>
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (err) {
      alert('Error updating booking status: ' + err.message);
    }
  };

  return (
    <>
    <AdminNavbar/>
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Bookings</h2>

      {loading ? (
        <div className="flex justify-center">
          <ThreeDots
            height="50"
            width="50"
            radius="9"
            color="#3b82f6"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Tour</th>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id} className="border-t">
                  <td className="px-6 py-4">{booking.tour?.name}</td>
                  <td className="px-6 py-4">{booking.user?.name}</td>
                  <td className="px-6 py-4">${booking.price}</td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-red-500 hover:text-red-700">
                      Delete
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

export default AdminManageBookings;
