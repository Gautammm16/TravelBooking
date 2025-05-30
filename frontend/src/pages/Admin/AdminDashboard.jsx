import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart
} from "recharts";
import { FiRefreshCw, FiTrendingUp, FiTrendingDown, FiCalendar, FiUser, FiDollarSign, FiMapPin } from "react-icons/fi";
import AdminNavbar from "../../components/admin/AdminNavbar.jsx";

// Color palette
const COLORS = {
  primary: "#6366F1",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  text: "#374151",
  muted: "#6B7280"
};

// Pie chart colors
const PIE_COLORS = [
  "#6366F1", // primary
  "#10B981", // secondary
  "#F59E0B", // accent
  "#EF4444", // danger
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16"  // lime
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [timeRange, setTimeRange] = useState("6months");
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/v1/tours/stats?range=${timeRange}`);
      setStats(res.data.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError("");
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError(err.response?.data?.message || "Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  // const fetchRecentBookings = async () => {
  //   try {
  //     setBookingsLoading(true);
  //     const res = await axios.get("http://localhost:5000/api/v1/bookings?limit=5&sort=-createdAt");
  //     setRecentBookings(res.data.data.bookings);
  //   } catch (err) {
  //     console.error("Failed to fetch recent bookings:", err);
  //   } finally {
  //     setBookingsLoading(false);
  //   }
  // };


const fetchRecentBookings = async () => {
  try {
    setBookingsLoading(true);

    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:5000/api/v1/bookings?limit=5&sort=-createdAt",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRecentBookings(res.data.data.bookings);
  } catch (err) {
    console.error("Failed to fetch recent bookings:", err);
  } finally {
    setBookingsLoading(false);
  }
};


  useEffect(() => {
    fetchStats();
    fetchRecentBookings();
  }, [timeRange]);

  // Loading spinner component
  const LoadingSpinner = ({ size = "md" }) => {
    const sizes = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12"
    };
    
    return (
      <div className={`animate-spin rounded-full border-2 border-solid border-indigo-500 border-t-transparent ${sizes[size]}`} />
    );
  };

  if (loading && !stats) return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
        <h3 className="font-bold mb-1">Error loading dashboard</h3>
        <p>{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Ensure all chart data has proper fallbacks
  const monthlyStats = stats?.monthlyStats || [];
  const topRatedTours = stats?.topRatedTours || [];
  const mostBookedTours = stats?.mostBookedTours || [];
  const categoryDistribution = stats?.categoryDistribution || [];
  const difficultyDistribution = stats?.difficultyDistribution || [];
  const priceRangeDistribution = stats?.priceRangeDistribution || [];
  const monthlyBookingStats = stats?.monthlyBookingStats || [];

  // Format date for recent bookings
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <AdminNavbar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdated}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button 
              onClick={() => {
                fetchStats();
                fetchRecentBookings();
              }}
              disabled={loading}
              className={`flex items-center gap-1 text-sm bg-white hover:bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg shadow-sm border transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Total Tours" 
            value={stats?.tourCount || 0} 
            icon="🗺️"
            trend="up"
            change="5% from last period"
            loading={loading}
          />
          <StatCard 
            label="Total Bookings" 
            value={stats?.bookingCount || 0}
            icon="📅"
            trend="up"
            change="12% from last period"
            loading={loading}
          />
          <StatCard 
            label="Total Revenue" 
            value={`$${(stats?.totalRevenue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
            icon="💰"
            trend="up"
            change="8% from last period"
            loading={loading}
          />
          <StatCard 
            label="Avg. Rating" 
            value={(stats?.avgRating || 0).toFixed(2)}
            icon="⭐"
            trend="steady"
            change="Same as last period"
            loading={loading}
          />
        </div>

        {/* Recent Bookings and Stats Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Bookings */}
          <div className="bg-white shadow rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Recent Bookings</h3>
              {bookingsLoading && <LoadingSpinner size="sm" />}
            </div>
            {bookingsLoading ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, idx) => (
                    <div key={booking._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.tour?.name || 'Tour not available'}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <FiUser className="mr-1" />
                            <span>{booking.user?.firstName || 'User not available'}</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-indigo-600">
                          ${booking.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center text-gray-500">
                          <FiCalendar className="mr-1" />
                          <span>{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <FiMapPin className="mr-1" />
                          <span>{booking.tour?.duration || 'N/A'} days</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent bookings available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Monthly Stats Chart */}
          <div className="bg-white shadow rounded-xl p-4 md:p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Monthly Tour Creation</h3>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            <div className="h-64 md:h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyStats}>
                    <defs>
                      <linearGradient id="colorTours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: COLORS.muted }}
                      axisLine={{ stroke: COLORS.muted }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fill: COLORS.muted }}
                      axisLine={{ stroke: COLORS.muted }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tours" 
                      name="Tours Created" 
                      stroke={COLORS.primary} 
                      fillOpacity={1} 
                      fill="url(#colorTours)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Rated Tours Chart */}
          <div className="bg-white shadow rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Top Rated Tours</h3>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            <div className="h-64 md:h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topRatedTours}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      type="number" 
                      domain={[0, 5]} 
                      tick={{ fill: COLORS.muted }}
                      axisLine={{ stroke: COLORS.muted }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120}
                      tick={{ fill: COLORS.muted }}
                      axisLine={{ stroke: COLORS.muted }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="ratingsAverage" 
                      name="Average Rating" 
                      fill={COLORS.secondary} 
                      radius={[0, 4, 4, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Booking Trends */}
          <div className="bg-white shadow rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Monthly Booking & Revenue Trends</h3>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            <div className="h-64 md:h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyBookingStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: COLORS.muted }}
                      axisLine={{ stroke: COLORS.muted }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: COLORS.muted }}
                      axisLine={{ stroke: COLORS.muted }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: COLORS.muted }}
                      axisLine={{ stroke: COLORS.muted }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value?.toLocaleString()}` : value,
                        name === 'bookings' ? 'Bookings' : 'Revenue'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="bookings" 
                      name="Bookings"
                      fill={COLORS.primary} 
                      radius={[2, 2, 0, 0]}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue"
                      stroke={COLORS.secondary} 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Distribution Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Booked Tours */}
          <div className="bg-white shadow rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Top Booked Tours</h3>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-4">
                {mostBookedTours.map((tour, idx) => (
                  <div key={tour.tourId || idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tour.name}</p>
                      <p className="text-xs text-gray-500 truncate">Tour ID: {tour.tourId}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {tour.bookings} bookings
                    </div>
                  </div>
                ))}
                {mostBookedTours.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No booking data available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tour Difficulty Distribution */}
          <div className="bg-white shadow rounded-xl p-4 md:p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Tour Difficulty Distribution</h3>
              {loading && <LoadingSpinner size="sm" />}
            </div>
            <div className="h-64 md:h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="difficulty"
                      label={({ difficulty, percent }) => `${difficulty}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {difficultyDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} tours`,
                        `Difficulty: ${props.payload.difficulty}`
                      ]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Price Range Distribution */}
        <div className="bg-white shadow rounded-xl p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Price Range Distribution</h3>
            {loading && <LoadingSpinner size="sm" />}
          </div>
          <div className="h-64 md:h-80">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={priceRangeDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: COLORS.muted }}
                    axisLine={{ stroke: COLORS.muted }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fill: COLORS.muted }}
                    axisLine={{ stroke: COLORS.muted }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name, props) => [
                      `${value} tours`,
                      `Tours in ${props.payload.category}`,
                      props.payload.avgPrice ? `Avg: $${props.payload.avgPrice}` : ''
                    ]}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Number of Tours"
                    fill={COLORS.danger} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, change, loading }) => {
  const trendColors = {
    up: { text: "text-green-600", bg: "bg-green-100", icon: <FiTrendingUp className="h-4 w-4" /> },
    down: { text: "text-red-600", bg: "bg-red-100", icon: <FiTrendingDown className="h-4 w-4" /> },
    steady: { text: "text-yellow-600", bg: "bg-yellow-100", icon: null }
  };

  return (
    <div className="bg-white shadow p-4 rounded-xl hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          {loading ? (
            <div className="h-8 w-20 mt-2 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {!loading && trend && (
        <div className={`mt-2 text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${trendColors[trend].bg} ${trendColors[trend].text}`}>
          {trendColors[trend].icon}
          {change}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;