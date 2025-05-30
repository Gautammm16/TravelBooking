import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ThreeDots } from 'react-loader-spinner';
import AdminNavbar from '../../components/admin/AdminNavbar.jsx';

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/v1/users/displayall');
        setUsers(data.data.users || []);
        setTotalPages(Math.ceil(data.data.users.length / usersPerPage));
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/v1/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        // Recalculate total pages after deletion
        setTotalPages(Math.ceil((users.length - 1) / usersPerPage));
        // Adjust current page if we deleted the last item on the page
        if (users.length % usersPerPage === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const actualTotalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminNavbar />
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Manage Users</h2>
          <input
            type="text"
            placeholder="Search users..."
            className="border p-2 rounded w-full md:w-64 text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
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
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-[200px] md:max-w-none">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'guide' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {user.role === 'admin' ? (
                            <span className="text-gray-400 cursor-not-allowed text-xs md:text-sm">Admin protected</span>
                          ) : (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-150 text-xs md:text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {actualTotalPages > 1 && (
              <div className="flex flex-wrap justify-center mt-4 md:mt-6 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                
                {/* Show first page + ellipsis if needed */}
                {currentPage > 2 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className={`px-3 py-1 text-sm rounded ${1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      1
                    </button>
                    {currentPage > 3 && <span className="px-1 py-1">...</span>}
                  </>
                )}

                {/* Show current page and neighbors */}
                {[
                  currentPage - 1,
                  currentPage,
                  currentPage + 1
                ].map(page => (
                  page >= 1 && page <= actualTotalPages && (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Show last page + ellipsis if needed */}
                {currentPage < actualTotalPages - 1 && (
                  <>
                    {currentPage < actualTotalPages - 2 && <span className="px-1 py-1">...</span>}
                    <button
                      onClick={() => handlePageChange(actualTotalPages)}
                      className={`px-3 py-1 text-sm rounded ${actualTotalPages === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {actualTotalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === actualTotalPages}
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

export default AdminManageUsers;