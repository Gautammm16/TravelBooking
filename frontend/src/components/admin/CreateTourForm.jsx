// components/admin/CreateTourForm.jsx
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export const CreateTourForm = ({ onSubmit, initialData }) => {
  const [tourData, setTourData] = useState(initialData || {
    name: '',
    price: '',
    duration: '',
    difficulty: 'easy',
    summary: '',
    description: '',
    startDates: [],
    maxGroupSize: '',
    imageCover: ''
  })

  const handleDateChange = (dates) => {
    setTourData({ ...tourData, startDates: dates })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onSubmit({
        ...tourData,
        price: Number(tourData.price),
        duration: Number(tourData.duration),
        maxGroupSize: Number(tourData.maxGroupSize)
      }, !!initialData)
      
      if (!initialData) {
        setTourData({
          name: '',
          price: '',
          duration: '',
          difficulty: 'easy',
          summary: '',
          description: '',
          startDates: [],
          maxGroupSize: '',
          imageCover: ''
        })
      }
    } catch (error) {
      // Error handled in parent
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">
        {initialData ? 'Edit Tour' : 'Create New Tour'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tour Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Tour Name</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            value={tourData.name}
            onChange={(e) => setTourData({ ...tourData, name: e.target.value })}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Price ($)</label>
          <input
            type="number"
            required
            min="0"
            className="w-full p-2 border rounded"
            value={tourData.price}
            onChange={(e) => setTourData({ ...tourData, price: e.target.value })}
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Duration (days)</label>
          <input
            type="number"
            required
            min="1"
            className="w-full p-2 border rounded"
            value={tourData.duration}
            onChange={(e) => setTourData({ ...tourData, duration: e.target.value })}
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Difficulty</label>
          <select
            className="w-full p-2 border rounded"
            value={tourData.difficulty}
            onChange={(e) => setTourData({ ...tourData, difficulty: e.target.value })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>

        {/* Max Group Size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Max Group Size</label>
          <input
            type="number"
            required
            min="1"
            className="w-full p-2 border rounded"
            value={tourData.maxGroupSize}
            onChange={(e) => setTourData({ ...tourData, maxGroupSize: e.target.value })}
          />
        </div>

        {/* Start Dates */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Start Dates</label>
          <DatePicker
            selected={tourData.startDates[0]}
            onChange={handleDateChange}
            startDate={tourData.startDates[0]}
            endDate={tourData.startDates[1]}
            selectsRange
            inline
            multiple
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Summary */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Summary</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            value={tourData.summary}
            onChange={(e) => setTourData({ ...tourData, summary: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            required
            rows="4"
            className="w-full p-2 border rounded"
            value={tourData.description}
            onChange={(e) => setTourData({ ...tourData, description: e.target.value })}
          />
        </div>

        {/* Image Cover */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Image URL</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded"
            value={tourData.imageCover}
            onChange={(e) => setTourData({ ...tourData, imageCover: e.target.value })}
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {initialData ? 'Update Tour' : 'Create Tour'}
          </button>
        </div>
      </div>
    </form>
  )
}