// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const AdminCustomTourRequests = () => {
//   const [requests, setRequests] = useState([]);

//   const fetchRequests = async () => {
//     const res = await axios.get('/api/custom-tour-requests', {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     });
//     setRequests(res.data.requests);
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const handleStatusChange = async (id, status) => {
//     await axios.patch(`/api/custom-tour-requests/${id}`, { status }, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     });
//     fetchRequests();
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Custom Tour Requests</h2>
//       <div className="space-y-4">
//         {requests.map(req => (
//           <div key={req._id} className="border p-4 rounded shadow">
//             <p><strong>User:</strong> {req.user?.name}</p>
//             <p><strong>Destination:</strong> {req.destination}</p>
//             <p><strong>Duration:</strong> {req.duration} days</p>
//             <p><strong>Group Size:</strong> {req.groupSize}</p>
//             <p><strong>Budget:</strong> ${req.budget}</p>
//             <p><strong>Preferences:</strong> {req.preferences}</p>
//             <p><strong>Status:</strong> {req.status}</p>
//             <div className="space-x-2 mt-2">
//               <button onClick={() => handleStatusChange(req._id, 'approved')} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
//               <button onClick={() => handleStatusChange(req._id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AdminCustomTourRequests;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/admin/AdminNavbar'; // Make sure this path is correct

const AdminCustomTourRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      fetchRequests(); // Refresh the list after update
    } catch (err) {
      console.error('Error updating request:', err);
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

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
    <div className="flex">
      <AdminNavbar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Custom Tour Requests</h1>
          
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.user?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user?.email || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.duration} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.groupSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${request.budget}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'pending' && (
                            <div className="space-x-2">
                              <button
                                onClick={() => handleStatusChange(request._id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(request._id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomTourRequests;