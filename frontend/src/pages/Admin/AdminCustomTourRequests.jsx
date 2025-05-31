import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminCustomTourRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 10;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/custom-tour-requests', {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setRequests(res.data.requests || []);
      setError('');
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch requests');
      toast.error(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `/api/custom-tour-requests/${id}`,
        { status },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success(`Request ${status} successfully`);
      fetchRequests();
    } catch (err) {
      console.error('Error updating request:', err);
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  // Pagination Logic
  const totalPages = useMemo(() => Math.ceil(requests.length / requestsPerPage), [requests]);
  const currentRequests = useMemo(() => {
    const start = (currentPage - 1) * requestsPerPage;
    return requests.slice(start, start + requestsPerPage);
  }, [requests, currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const renderPagination = () => (
    <div className="flex flex-wrap justify-center items-center p-4 gap-2">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => paginate(i + 1)}
          className={`px-3 py-1 text-sm rounded ${currentPage === i + 1
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchRequests}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminNavbar />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Custom Tour Requests</h1>
          
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No custom tour requests found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Duration</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Group Size</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Budget</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.user?.firstName || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-none">
                                {request.user?.email || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="line-clamp-1">{request.destination}</span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {request.duration} days
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {request.groupSize}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          ${request.budget}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'pending' && (
                            <div className="flex flex-col xs:flex-row gap-1 xs:gap-2">
                              <button
                                onClick={() => handleStatusChange(request._id, 'approved')}
                                className="text-green-600 hover:text-green-900 text-xs xs:text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(request._id, 'rejected')}
                                className="text-red-600 hover:text-red-900 text-xs xs:text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && renderPagination()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomTourRequests;
