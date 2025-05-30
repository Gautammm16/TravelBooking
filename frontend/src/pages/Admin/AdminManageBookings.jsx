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
        setLoading(true);
        const { data } = await api.get(`/v1/bookings?page=${currentPage}&limit=${bookingsPerPage}`);
        const bookingsData = data.data?.bookings || data.bookings || [];
        const totalResults = data.total || data.results || 0;

        setBookings(bookingsData);
        setTotalBookings(totalResults);
        setTotalPages(Math.ceil(totalResults / bookingsPerPage));
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
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
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await api.delete(`/v1/bookings/${bookingId}`);
      const updatedTotal = totalBookings - 1;
      const updatedBookings = bookings.filter(booking => booking._id !== bookingId);

      setBookings(updatedBookings);
      setTotalBookings(updatedTotal);
      const newTotalPages = Math.ceil(updatedTotal / bookingsPerPage);
      setTotalPages(newTotalPages);

      if (updatedBookings.length === 0 && currentPage > 1) {
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
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    const buttons = [];
    const maxVisiblePages = 5; // Maximum number of visible page buttons

    // Always show Prev button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        Prev
      </button>
    );

    // Show first page and ellipsis if needed
    if (currentPage > Math.floor(maxVisiblePages / 2) + 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 text-sm rounded ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          1
        </button>
      );
      if (currentPage > Math.floor(maxVisiblePages / 2) + 2) {
        buttons.push(<span key="left-ellipsis" className="px-2 py-1">...</span>);
      }
    }

    // Calculate range of pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Show page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {i}
        </button>
      );
    }

    // Show last page and ellipsis if needed
    if (currentPage < totalPages - Math.floor(maxVisiblePages / 2)) {
      if (currentPage < totalPages - Math.floor(maxVisiblePages / 2) - 1) {
        buttons.push(<span key="right-ellipsis" className="px-2 py-1">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 text-sm rounded ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {totalPages}
        </button>
      );
    }

    // Always show Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    );

    return <div className="flex flex-wrap justify-center gap-2">{buttons}</div>;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Manage Bookings</h2>
          <div className="text-sm md:text-base text-gray-600">
            Showing {(currentPage - 1) * bookingsPerPage + 1}-
            {Math.min(currentPage * bookingsPerPage, totalBookings)} of {totalBookings} bookings
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <ThreeDots height="50" width="50" color="#3b82f6" visible />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-lg shadow">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">User</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.length > 0 ? (
                    bookings.map(booking => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-3 py-4">
                          <div className="flex items-center">
                            {booking.tour?.imageCover && (
                              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                                <img
                                  className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
                                  src={booking.tour.imageCover}
                                  alt={booking.tour.name}
                                />
                              </div>
                            )}
                            <div className="ml-2 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">
                                {booking.tour?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.tour?.duration || 'N/A'} days
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 hidden sm:table-cell">
                          <div className="text-xs md:text-sm text-gray-900">
                            {getUserFirstName(booking.user)}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-none">
                            {booking.user?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-xs md:text-sm text-gray-500">
                          ${booking.price}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap gap-1">
                            {['pending', 'confirmed', 'cancelled'].map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(booking._id, status)}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  booking.status === status
                                    ? {
                                        pending: 'bg-yellow-500 text-white',
                                        confirmed: 'bg-green-500 text-white',
                                        cancelled: 'bg-red-500 text-white',
                                      }[status]
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-right text-xs md:text-sm font-medium">
                          <button
                            onClick={() => handleDeleteBooking(booking._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 md:mt-6">
                {renderPagination()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminManageBookings;