import { useState, useEffect } from 'react'
import { createBooking, initPayment } from '../services/api'
import Loader from '../components/Loader'

export default function TourDetails({ tours, user, setBookings, addNotification }) {
  const [bookingState, setBookingState] = useState({
    participants: 1,
    date: '',
    specialRequests: '',
    paymentLoading: false
  })

  const [tour] = useState(() => 
    tours.find(t => t._id === window.location.pathname.split('/').pop())
  )

  const handlePayment = async () => {
    try {
      setBookingState(prev => ({ ...prev, paymentLoading: true }));
      
      // Add error handling for missing tour/user
      if (!tour || !user) {
        throw new Error('Tour or user information missing');
      }
  
      // Initialize payment
      const order = await initPayment({
        tourId: tour._id,
        participants: bookingState.participants,
        userId: user._id
      });
  
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY,
          amount: order.amount,
          currency: 'INR',
          name: 'Explorer Travels',
          order_id: order.id,
          handler: async (response) => {
            try {
              const booking = await createBooking({
                ...bookingState,
                tour: tour._id,
                user: user._id,
                paymentId: response.razorpay_payment_id
              });
              
              setBookings(prev => [...prev, booking]);
              addNotification('Booking successful!', 'success');
            } catch (error) {
              addNotification(error.response?.data?.message || 'Booking failed', 'error');
            }
          },
          prefill: {
            email: user.email,
            name: user.name
          },
          theme: {
            color: '#3399cc'
          }
        });
        rzp.open();
      };
      document.body.appendChild(script);
  
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setBookingState(prev => ({ ...prev, paymentLoading: false }));
    }
  };

  if (!tour) return <div className="text-center py-20">Tour not found</div>

  return (
    <div className="container mx-auto p-4">
      {/* ... Tour details UI ... */}
      <button
        onClick={handlePayment}
        disabled={!user || bookingState.paymentLoading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {bookingState.paymentLoading ? (
          <Loader size="small" />
        ) : (
          `Pay $${tour.price * bookingState.participants}`
        )}
      </button>
    </div>
  )
}