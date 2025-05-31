// Payment.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Calendar } from 'lucide-react';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    method: 'credit-card', // Default to credit-card to match booking model
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const { tourId, tourName, price, imageCover, duration, startDates, maxGroupSize } = state || {};

  useEffect(() => {
    if (!state) navigate('/');
    if (startDates?.length > 0) setSelectedDate(startDates[0]);
  }, [state, navigate, startDates]);

  const createRazorpayOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = user?.token || localStorage.getItem('token');
      const totalAmount = price * participants;

      const response = await axios.post(
        'http://localhost:5000/api/v1/bookings/create-order',
        { 
          amount: totalAmount,
          tourId,
          participants,
          startDate: selectedDate
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (err) {
      console.error('Error creating Razorpay order:', err);
      setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPayment = async () => {
    try {
      setLoading(true);
      const token = user?.token || localStorage.getItem('token');
      const totalPrice = price * participants;

      const response = await axios.post(
        'http://localhost:5000/api/v1/bookings',
        {
          tour: tourId,
          price: totalPrice,
          paymentMethod: paymentDetails.method, // Using the mapped value
          participants,
          startDate: selectedDate,
          cardInfo: {
            cardNumber: paymentDetails.cardNumber,
            expiry: paymentDetails.expiry,
            cvv: paymentDetails.cvv
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        navigate('/my-bookings', { state: { bookingSuccess: true } });
      }
    } catch (err) {
      console.error('Payment error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError(err.response?.data?.message || 
              'Payment failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (paymentDetails.method === 'credit-card') {
      // Validate card details for credit card payments
      if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv) {
        setError('Please fill all payment details');
        return;
      }

      const cardNumberRegex = /^\d{16}$/;
      const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
      const cvvRegex = /^\d{3}$/;

      if (!cardNumberRegex.test(paymentDetails.cardNumber)) {
        setError('Invalid card number. Must be 16 digits.');
        return;
      }
      if (!expiryRegex.test(paymentDetails.expiry)) {
        setError('Invalid expiry date. Format MM/YY.');
        return;
      } else {
        const [month, year] = paymentDetails.expiry.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          setError('Card expiry date must be in the future.');
          return;
        }
      }
      if (!cvvRegex.test(paymentDetails.cvv)) {
        setError('Invalid CVV. Must be 3 digits.');
        return;
      }

      return handleDirectPayment();
    } else if (paymentDetails.method === 'paypal') {
      // Handle PayPal payment
      return handleDirectPayment();
    } else if (paymentDetails.method === 'bank-transfer') {
      // Handle bank transfer
      return handleDirectPayment();
    } else {
      // Handle Razorpay payment
      try {
        setLoading(true);
        const order = await createRazorpayOrder();
        if (!order) return;

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: order.data.order.amount,
          currency: order.data.order.currency,
          name: tourName,
          description: `Booking for ${tourName}`,
          image: imageCover,
          order_id: order.data.order.id,
          handler: async function (response) {
            try {
              const token = user?.token || localStorage.getItem('token');
              const totalPrice = price * participants;

              await axios.post(
                'http://localhost:5000/api/v1/bookings/verify-payment',
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  tourId,
                  price: totalPrice,
                  participants,
                  startDate: selectedDate,
                  paymentMethod: 'credit-card' // Map Razorpay to credit-card
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  }
                }
              );
              navigate('/my-bookings');
            } catch (err) {
              console.error('Payment verification error:', err);
              setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
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
          modal: {
            ondismiss: () => {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error('Payment error:', err);
        setError(err.response?.data?.message || 'Payment failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber' || name === 'cvv') {
      if (!/^\d*$/.test(value)) return;
    }

    if (name === 'expiry') {
      // Auto-format as MM/YY
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return;
      setPaymentDetails((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantsChange = (action) => {
    setParticipants((prev) => {
      const updated = action === 'increase' ? prev + 1 : prev - 1;
      if (updated < 1) return 1;
      if (maxGroupSize && updated > maxGroupSize) {
        setError(`Cannot book more than ${maxGroupSize} participants.`);
        return prev;
      }
      setError(null);
      return updated;
    });
  };

  const handleMonthYearSelect = (month, year) => {
    const formattedYear = year.toString().slice(-2);
    setPaymentDetails(prev => ({
      ...prev,
      expiry: `${month.toString().padStart(2, '0')}/${formattedYear}`
    }));
    setShowExpiryPicker(false);
  };

  const renderExpiryPicker = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
      <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-2">
          {months.map(month => (
            <button
              key={month}
              className={`p-2 rounded text-sm ${paymentDetails.expiry.startsWith(month.toString().padStart(2, '0')) ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => {
                const selectedYear = paymentDetails.expiry.split('/')[1] || years[0].toString().slice(-2);
                handleMonthYearSelect(month, parseInt(`20${selectedYear}`));
              }}
            >
              {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' })}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <select
            className="w-full p-2 border rounded"
            value={paymentDetails.expiry.split('/')[1] ? parseInt(`20${paymentDetails.expiry.split('/')[1]}`) : currentYear}
            onChange={(e) => {
              const month = paymentDetails.expiry.split('/')[0] || currentMonth.toString().padStart(2, '0');
              handleMonthYearSelect(parseInt(month), parseInt(e.target.value));
            }}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const renderCardFields = () => {
    if (paymentDetails.method !== 'credit-card') return null;

    return (
      <>
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={paymentDetails.cardNumber}
          onChange={handleInputChange}
          maxLength={16}
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        
        <div className="relative mb-4">
          <input
            type="text"
            name="expiry"
            placeholder="Expiry Date (MM/YY)"
            value={paymentDetails.expiry}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button 
            type="button" 
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            onClick={() => setShowExpiryPicker(!showExpiryPicker)}
          >
            <Calendar size={18} />
          </button>
          {showExpiryPicker && renderExpiryPicker()}
        </div>
        
        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          value={paymentDetails.cvv}
          onChange={handleInputChange}
          maxLength={3}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen rounded-xl shadow-md">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 mb-6 hover:underline">
        <ArrowLeft size={18} className="mr-2" /> Back to Tour
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Complete Your Booking</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-3">Tour Details</h2>
              <div className="flex items-center space-x-4">
                <img src={imageCover} alt={tourName} className="w-24 h-24 object-cover rounded-lg shadow" />
                <div>
                  <h3 className="text-lg font-medium">{tourName}</h3>
                  <p className="text-gray-600">{duration} day tour</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-3">Select Date</h2>
              <div className="flex flex-wrap gap-2">
                {startDates?.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                      selectedDate === date ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold mb-3">Number of Participants</h2>
              <div className="inline-flex items-center border rounded overflow-hidden">
                <button
                  onClick={() => handleParticipantsChange('decrease')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
                >
                  -
                </button>
                <div className="px-6 py-2 bg-gray-100 min-w-[40px] text-center">{participants}</div>
                <button
                  onClick={() => handleParticipantsChange('increase')}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              {maxGroupSize && (
                <p className="text-sm text-gray-500 mt-1">Maximum allowed: {maxGroupSize}</p>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">Payment Details</h2>
              <select
                name="method"
                value={paymentDetails.method}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="credit-card">Credit/Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>
              {renderCardFields()}
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Tour Price</span>
                  <span>${price} x {participants}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${price * participants}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center text-red-500 mb-4 text-sm">
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
      </div>
    </div>
  );
};

export default Payment;