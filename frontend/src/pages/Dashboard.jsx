import { useState } from 'react'
import Loader from '../components/Loader'

export default function Dashboard({ user, bookings, cancelBooking }) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [cancelLoading, setCancelLoading] = useState(null)

  const upcomingBookings = bookings.filter(
    b => new Date(b.date) > new Date()
  )
  const pastBookings = bookings.filter(
    b => new Date(b.date) <= new Date()
  )

  const handleCancel = async (bookingId) => {
    setCancelLoading(bookingId)
    try {
      await cancelBooking(bookingId)
    } finally {
      setCancelLoading(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'upcoming' ? 
            'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'past' ? 
            'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('past')}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      <div className="space-y-4">
        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(booking => (
          <div key={booking._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{booking.tour.name}</h3>
                <p className="text-gray-600">
                  {new Date(booking.date).toLocaleDateString()} - 
                  {booking.participants} participants
                </p>
                <p className="font-bold">Total: ${booking.totalPrice}</p>
              </div>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  disabled={cancelLoading === booking._id}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  {cancelLoading === booking._id ? (
                    <Loader size="small" />
                  ) : (
                    'Cancel'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}