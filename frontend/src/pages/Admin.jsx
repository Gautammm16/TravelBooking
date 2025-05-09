import { useState, useEffect } from 'react'
import { createTour, updateTour } from '../services/api'

export default function Admin({ user, tours, setTours }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    difficulty: 'easy',
    description: ''
  })
  const [editMode, setEditMode] = useState(null)

  const handleTourSubmit = async (e) => {
    e.preventDefault()
    try {
      const newTour = editMode 
        ? await updateTour(editMode, formData)
        : await createTour(formData)
      
      setTours(prev => editMode 
        ? prev.map(t => t._id === editMode ? newTour : t)
        : [...prev, newTour]
      )
      setFormData({ name: '', price: '', difficulty: 'easy', description: '' })
      setEditMode(null)
    } catch (error) {
      // Handle error
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tour Management</h1>
      
      <form onSubmit={handleTourSubmit} className="mb-8 space-y-4">
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Tour name"
        />
        {/* Other tour fields */}
        <button type="submit">
          {editMode ? 'Update Tour' : 'Create Tour'}
        </button>
      </form>

      <div className="space-y-4">
        {tours.map(tour => (
          <div key={tour._id} className="bg-white p-4 shadow">
            <h3 className="text-xl font-bold">{tour.name}</h3>
            <button onClick={() => {
              setFormData(tour)
              setEditMode(tour._id)
            }}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}