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
    <>
      <AdminNavbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-t">
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="text-gray-400 cursor-not-allowed">Cannot delete</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-500 hover:text-red-700"
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
    </>
  );
};

export default AdminManageUsers;
