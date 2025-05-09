import { useState } from 'react'
import StarRating from './StarRating'

export default function ReviewSection({ tour, user, onReviewSubmit }) {
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)

  const handleSubmit = () => {
    if (!reviewText.trim()) return
    onReviewSubmit({
      tour: tour._id,
      user: user._id,
      rating,
      review: reviewText
    })
    setReviewText('')
    setRating(5)
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Reviews ({tour.reviews?.length || 0})</h3>
      
      {user && (
        <div className="mb-6">
          <StarRating rating={rating} onRate={setRating} />
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
          />
          <button onClick={handleSubmit}>Submit Review</button>
        </div>
      )}

      <div className="space-y-4">
        {tour.reviews?.map(review => (
          <div key={review._id} className="bg-gray-50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src={review.user.photo} 
                className="w-8 h-8 rounded-full"
              />
              <span>{review.user.name}</span>
              <StarRating rating={review.rating} />
            </div>
            <p>{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  )
}