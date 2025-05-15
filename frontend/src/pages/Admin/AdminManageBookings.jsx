import React, { useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import api from '../../services/api';
import AdminNavbar from "../../components/admin/AdminNavbar.jsx";

const AdminManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const bookingsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get(`/v1/bookings?page=${currentPage}&limit=${bookingsPerPage}`);
        setBookings(data.data.bookings);
        setTotalBookings(data.results);
        setTotalPages(Math.ceil(data.results / bookingsPerPage));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentPage]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/v1/bookings/${bookingId}`, { status: newStatus });
      setBookings(bookings.map(booking =>
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (err) {
      alert('Error updating booking status: ' + err.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await api.delete(`/v1/bookings/${bookingId}`);
      setBookings(bookings.filter(booking => booking._id !== bookingId));
      setTotalBookings(totalBookings - 1);
      setTotalPages(Math.ceil((totalBookings - 1) / bookingsPerPage));
      
      // If we deleted the last item on the page, go back one page
      if (bookings.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      alert('Booking deleted successfully');
    } catch (err) {
      alert('Error deleting booking: ' + err.message);
    }
  };

  const getUserFirstName = (user) => {
    if (!user) return 'N/A';
    return user.name ? user.name.split(' ')[0] : user.email.split('@')[0];
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Manage Bookings</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">Total Bookings: {totalBookings}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
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
            <div className="overflow-x-auto mb-6">
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
                      <td className="px-6 py-4">{getUserFirstName(booking.user)}</td>
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
                        <button 
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

export default AdminManageBookings;