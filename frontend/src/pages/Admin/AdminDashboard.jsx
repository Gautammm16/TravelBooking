import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ThreeDots } from 'react-loader-spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/v1/tours/stats');
        setStats(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots color="#3b82f6" height={50} width={50} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Vertical Sidebar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Tours</h3>
            <p className="text-2xl">{stats.tourCount}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Average Rating</h3>
            <p className="text-2xl">{stats.avgRating?.toFixed(1) || 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Bookings</h3>
            <p className="text-2xl">{stats.bookingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tours" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
