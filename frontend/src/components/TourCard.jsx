// components/TourCard.jsx
import { Link } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/24/solid'

const TourCard = ({ tour }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img 
          src={tour.imageCover} 
          alt={tour.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded-full text-sm font-medium">
          {tour.duration} days
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{tour.summary}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="font-medium">{tour.ratingsAverage}</span>
            <span className="text-gray-500 ml-1">({tour.ratingsQuantity})</span>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">
              ${tour.price}
            </p>
            <p className="text-sm text-gray-500">per person</p>
          </div>
        </div>

        <Link 
          to={`/tours/${tour._id}`}
          className="mt-4 inline-block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default TourCard