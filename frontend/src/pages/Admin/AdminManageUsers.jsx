import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ThreeDots } from 'react-loader-spinner';
import AdminNavbar from '../../components/admin/AdminNavbar.jsx';

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/v1/users/displayall');
        setUsers(data.data.users);
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
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminNavbar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

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
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role === 'admin' ? (
                        <span className="text-gray-400 cursor-not-allowed">Cannot delete</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-150"
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
        )}
      </div>
    </div>
  );
};

export default AdminManageUsers;