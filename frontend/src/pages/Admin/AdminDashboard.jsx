// components/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { LineChart, BarChart, PieChart } from 'recharts'
import { CSVLink } from 'react-csv'
import { CloudinaryUploadWidget } from '../common'
import {
  UsersTable, ToursTable, BookingsTable, ReviewsTable,
  StatsDashboard, BulkActions
} from './'
import {
  getAllUsers, updateUserRole, bulkDeleteUsers,
  getAllTours, createTour, updateTour, deleteTour,
  getAllBookings, updateBookingStatus,
  getAllReviews, moderateReview,
  exportData
} from '../../services/adminService'
import { formatDate, convertToCSV } from '../../utils/helpers'

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats')
  const [selectedItems, setSelectedItems] = useState([])
  const [data, setData] = useState({
    users: [],
    tours: [],
    bookings: [],
    reviews: [],
    stats: {}
  })

  useEffect(() => {
    const loadData = async () => {
      const [users, tours, bookings, reviews, stats] = await Promise.all([
        getAllUsers(),
        getAllTours(),
        getAllBookings(),
        getAllReviews(),
        getStatistics()
      ])
      setData({ users, tours, bookings, reviews, stats })
    }
    loadData()
  }, [])

  // Bulk Operations Handler
  const handleBulkAction = async (action) => {
    switch(action.type) {
      case 'deleteUsers':
        await bulkDeleteUsers(selectedItems)
        setData(prev => ({
          ...prev,
          users: prev.users.filter(u => !selectedItems.includes(u._id))
        }))
        break
      // Add other bulk actions
    }
    setSelectedItems([])
  }

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 border-b">
        {['stats', 'users', 'tours', 'bookings', 'reviews'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        <BulkActions 
          selectedCount={selectedItems.length}
          onAction={handleBulkAction}
        />
        <CSVLink 
          data={convertToCSV(data[activeTab])}
          filename={`${activeTab}-export.csv`}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Export CSV
        </CSVLink>
      </div>

      {activeTab === 'stats' && <StatsDashboard data={data.stats} />}
      {activeTab === 'users' && (
        <UsersTable
          users={data.users}
          onRoleChange={async (userId, newRole) => {
            await updateUserRole(userId, newRole)
            setData(prev => ({
              ...prev,
              users: prev.users.map(u => 
                u._id === userId ? { ...u, role: newRole } : u
              )
            }))
          }}
          selectedItems={selectedItems}
          onSelect={setSelectedItems}
        />
      )}
      {activeTab === 'tours' && (
        <ToursTable
          tours={data.tours}
          onUpdate={handleTourUpdate}
          onImageUpload={handleImageUpload}
          selectedItems={selectedItems}
          onSelect={setSelectedItems}
        />
      )}
      {activeTab === 'bookings' && (
        <BookingsTable
          bookings={data.bookings}
          onStatusChange={handleBookingStatusChange}
        />
      )}
      {activeTab === 'reviews' && (
        <ReviewsTable
          reviews={data.reviews}
          onModerate={handleReviewModeration}
        />
      )}
    </div>
  )
}

// User Role Modification in UsersTable.jsx
const UsersTable = ({ users, onRoleChange, selectedItems, onSelect }) => (
  <table>
    {/* Table header */}
    <tbody>
      {users.map(user => (
        <tr key={user._id}>
          <td>
            <input
              type="checkbox"
              checked={selectedItems.includes(user._id)}
              onChange={(e) => handleSelect(e, user._id)}
            />
          </td>
          <td>{user.name}</td>
          <td>
            <select
              value={user.role}
              onChange={(e) => onRoleChange(user._id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="guide">Guide</option>
              <option value="admin">Admin</option>
            </select>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

// Review Moderation in ReviewsTable.jsx
const ReviewsTable = ({ reviews, onModerate }) => (
  <table>
    <tbody>
      {reviews.map(review => (
        <tr key={review._id}>
          <td>{review.text}</td>
          <td>{review.rating}/5</td>
          <td>
            <button onClick={() => onModerate(review._id, 'approved')}>
              Approve
            </button>
            <button onClick={() => onModerate(review._id, 'deleted')}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

// Advanced Statistics in StatsDashboard.jsx
const StatsDashboard = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <LineChart data={data.monthlyBookings}>
      {/* Chart configuration */}
    </LineChart>
    <PieChart data={data.tourPopularity}>
      {/* Chart configuration */}
    </PieChart>
  </div>
)

// Image Upload in ToursTable.jsx
const ImageUploadCell = ({ tourId, onUpload }) => {
  const [imageUrl, setImageUrl] = useState('')

  const handleUpload = (result) => {
    setImageUrl(result.info.secure_url)
    onUpload(tourId, result.info.secure_url)
  }

  return (
    <div>
      <CloudinaryUploadWidget onUpload={handleUpload} />
      {imageUrl && <img src={imageUrl} className="w-20 h-20 object-cover" />}
    </div>
  )
}

// Bulk Operations Component
const BulkActions = ({ selectedCount, onAction }) => (
  <div className="relative">
    <select 
      onChange={(e) => onAction(e.target.value)}
      disabled={selectedCount === 0}
      className="bg-gray-100 p-2 rounded"
    >
      <option>Bulk Actions ({selectedCount})</option>
      <option value="deleteUsers">Delete Selected Users</option>
      <option value="exportSelected">Export Selected</option>
    </select>
  </div>
)