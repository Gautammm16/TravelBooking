// // Payment.jsx
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

// const Payment = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [participants, setParticipants] = useState(1);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [razorpayOrder, setRazorpayOrder] = useState(null);

//   // Initialize with tour data from location state
//   const { tourId, tourName, price, imageCover, duration, startDates } = state || {};

//   useEffect(() => {
//     if (!state) {
//       navigate('/');
//     }
//     // Set first available date as default
//     if (startDates?.length > 0) {
//       setSelectedDate(startDates[0]);
//     }
//   }, [state, navigate, startDates]);

//   const createRazorpayOrder = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const token = user?.token || localStorage.getItem('token');
//       const totalAmount = price * participants;

//       const response = await axios.post(
//         'http://localhost:5000/api/v1/payments/create-razorpay-order',
//         { amount: totalAmount },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       setRazorpayOrder(response.data.data);
//     } catch (err) {
//       console.error('Error creating Razorpay order:', err);
//       setError('Failed to initialize payment. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async () => {
//     if (!selectedDate) {
//       setError('Please select a date');
//       return;
//     }

//     if (!razorpayOrder) {
//       await createRazorpayOrder();
//       return;
//     }

//     const options = {
//       key: process.env.REACT_APP_RAZORPAY_KEY_ID,
//       amount: razorpayOrder.order.amount,
//       currency: razorpayOrder.order.currency,
//       name: tourName,
//       description: `Booking for ${tourName}`,
//       image: imageCover,
//       order_id: razorpayOrder.order.id,
//       handler: async function(response) {
//         try {
//           setLoading(true);
          
//           const token = user?.token || localStorage.getItem('token');
//           const totalPrice = price * participants;

//           // Verify payment and create booking
//           const bookingResponse = await axios.post(
//             'http://localhost:5000/api/v1/bookings',
//             {
//               tour: tourId,
//               price: totalPrice,
//               paymentMethod: 'razorpay',
//               participants,
//               startDate: selectedDate,
//               paymentData: response
//             },
//             {
//               headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//               }
//             }
//           );

//           if (bookingResponse.data.status === 'success') {
//             setSuccess(true);
//           }
//         } catch (err) {
//           console.error('Booking error:', err);
//           setError('Payment verification failed. Please contact support.');
//         } finally {
//           setLoading(false);
//         }
//       },
//       prefill: {
//         name: user?.name || '',
//         email: user?.email || '',
//         contact: user?.phone || ''
//       },
//       theme: {
//         color: '#3399cc'
//       }
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     }).replace(/\//g, '-');
//   };

//   if (!state) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-gray-700 text-xl">No tour selected. Redirecting...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
//       <button 
//         onClick={() => navigate(-1)}
//         className="flex items-center text-blue-600 mb-6"
//       >
//         <ArrowLeft size={18} className="mr-2" /> Back to Tour
//       </button>

//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
//           Complete Your Booking
//         </h1>

//         {success ? (
//           <div className="text-center py-8">
//             <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
//             <p className="text-gray-600 mb-6">Your booking for {tourName} has been confirmed.</p>
//             <button
//               onClick={() => navigate('/my-bookings')}
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//             >
//               View My Bookings
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="md:col-span-2">
//               <div className="mb-6">
//                 <h2 className="text-xl font-semibold mb-4">Tour Details</h2>
//                 <div className="flex items-start">
//                   <img 
//                     src={imageCover} 
//                     alt={tourName} 
//                     className="w-24 h-24 object-cover rounded-lg mr-4"
//                   />
//                   <div>
//                     <h3 className="text-lg font-medium">{tourName}</h3>
//                     <p className="text-gray-600">{duration} day tour</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <h2 className="text-xl font-semibold mb-4">Select Date</h2>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                   {startDates?.map((date, index) => (
//                     <button
//                       key={index}
//                       onClick={() => setSelectedDate(date)}
//                       className={`p-3 rounded-lg text-center ${selectedDate === date ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
//                     >
//                       {formatDate(date)}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <h2 className="text-xl font-semibold mb-4">Number of Participants</h2>
//                 <div className="flex items-center">
//                   <button 
//                     onClick={() => setParticipants(prev => Math.max(1, prev - 1))}
//                     className="bg-gray-200 px-4 py-2 rounded-l-lg"
//                   >
//                     -
//                   </button>
//                   <div className="bg-gray-100 px-6 py-2">
//                     {participants}
//                   </div>
//                   <button 
//                     onClick={() => setParticipants(prev => prev + 1)}
//                     className="bg-gray-200 px-4 py-2 rounded-r-lg"
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-1">
//               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
//                 <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
//                 <div className="space-y-4 mb-6">
//                   <div className="flex justify-between">
//                     <span>Tour Price</span>
//                     <span>${price} x {participants}</span>
//                   </div>
//                   <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
//                     <span>Total</span>
//                     <span>${price * participants}</span>
//                   </div>
//                 </div>

//                 {error && (
//                   <div className="flex items-center text-red-500 mb-4">
//                     <XCircle size={18} className="mr-2" />
//                     <span>{error}</span>
//                   </div>
//                 )}

//                 <button
//                   onClick={handlePayment}
//                   disabled={loading || !selectedDate}
//                   className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="animate-spin mr-2" size={18} />
//                       Processing...
//                     </>
//                   ) : (
//                     'Proceed to Payment'
//                   )}
//                 </button>
//               </div>    
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Payment;



// Payment.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);

  // Initialize with tour data from location state
  const { tourId, tourName, price, imageCover, duration, startDates } = state || {};

  useEffect(() => {
    if (!state) {
      navigate('/');
    }
    // Set first available date as default
    if (startDates?.length > 0) {
      setSelectedDate(startDates[0]);
    }
  }, [state, navigate, startDates]);

  const createRazorpayOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = user?.token || localStorage.getItem('token');
      const totalAmount = price * participants;

      const response = await axios.post(
        'http://localhost:5000/api/v1/payments/create-order',
        { amount: totalAmount },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setRazorpayOrder(response.data.data);
    } catch (err) {
      console.error('Error creating Razorpay order:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (!razorpayOrder) {
      await createRazorpayOrder();
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: razorpayOrder.order.amount,
      currency: razorpayOrder.order.currency,
      name: tourName,
      description: `Booking for ${tourName}`,
      image: imageCover,
      order_id: razorpayOrder.order.id,
      handler: async function(response) {
        try {
          setLoading(true);
          
          const token = user?.token || localStorage.getItem('token');
          const totalPrice = price * participants;

          // Verify payment and create booking
          const bookingResponse = await axios.post(
            'http://localhost:5000/api/v1/payments/verify-payment',
            {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              tourId,
              price: totalPrice,
              participants,
              startDate: selectedDate,
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (bookingResponse.data.status === 'success') {
            setSuccess(true);
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          setError('Payment verification failed. Please contact support.');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-700 text-xl">No tour selected. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 mb-6"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Tour
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Complete Your Booking
        </h1>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your booking for {tourName} has been confirmed.</p>
            <button
              onClick={() => navigate('/my-bookings')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View My Bookings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Tour Details</h2>
                <div className="flex items-start">
                  <img 
                    src={imageCover} 
                    alt={tourName} 
                    className="w-24 h-24 object-cover rounded-lg mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{tourName}</h3>
                    <p className="text-gray-600">{duration} day tour</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Select Date</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {startDates?.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg text-center ${selectedDate === date ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Number of Participants</h2>
                <div className="flex items-center">
                  <button 
                    onClick={() => setParticipants(prev => Math.max(1, prev - 1))}
                    className="bg-gray-200 px-4 py-2 rounded-l-lg"
                  >
                    -
                  </button>
                  <div className="bg-gray-100 px-6 py-2">
                    {participants}
                  </div>
                  <button 
                    onClick={() => setParticipants(prev => prev + 1)}
                    className="bg-gray-200 px-4 py-2 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Tour Price</span>
                    <span>${price} x {participants}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${price * participants}</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center text-red-500 mb-4">
                    <XCircle size={18} className="mr-2" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || !selectedDate}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>    
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
