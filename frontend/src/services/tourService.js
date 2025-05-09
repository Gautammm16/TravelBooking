// services/tourService.js
export const getAllTours = async () => {
    const response = await fetch('/api/v1/tours')
    const data = await response.json()
    return data.data
  }
  
  export const createTour = async (tourData) => {
    const response = await fetch('/api/v1/tours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(tourData)
    })
    const data = await response.json()
    return data.data
  }
  
  export const updateTour = async (tourData) => {
    const response = await fetch(`/api/v1/tours/${tourData._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(tourData)
    })
    const data = await response.json()
    return data.data
  }
  
  export const deleteTour = async (tourId) => {
    await fetch(`/api/v1/tours/${tourId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
  }