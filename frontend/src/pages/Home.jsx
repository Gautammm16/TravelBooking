import { useState } from 'react'
import TourCard from '../components/TourCard.jsx'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function Home({ tours, loading }) {
  const [filters, setFilters] = useState({
    search: '',
    price: 5000,
    difficulty: 'all',
    dateRange: [null, null]
  })

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchesPrice = tour.price <= filters.price
    const matchesDifficulty = filters.difficulty === 'all' || 
      tour.difficulty === filters.difficulty
    const matchesDate = !filters.dateRange[0] || (
      new Date(tour.startDates[0]) >= filters.dateRange[0] &&
      (!filters.dateRange[1] || new Date(tour.startDates[0]) <= filters.dateRange[1])
    )
    return matchesSearch && matchesPrice && matchesDifficulty && matchesDate
  })

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 space-y-4 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2">Search</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block mb-2">Max Price: ${filters.price}</label>
            <input
              type="range"
              min="0"
              max="10000"
              className="w-full"
              value={filters.price}
              onChange={e => setFilters(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block mb-2">Difficulty</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.difficulty}
              onChange={e => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="difficult">Difficult</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2">Date Range</label>
            <DatePicker
              selectsRange
              startDate={filters.dateRange[0]}
              endDate={filters.dateRange[1]}
              onChange={update => setFilters(prev => ({ ...prev, dateRange: update }))}
              className="w-full p-2 border rounded"
              placeholderText="Select date range"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading tours...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map(tour => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}