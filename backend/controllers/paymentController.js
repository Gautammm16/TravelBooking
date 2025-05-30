// import razorpay from '../utils/razorpay.js';
// import Payment from '../models/Payment.js';
// import crypto from 'crypto';

// // Create Razorpay Order
// export const createOrder = async (req, res) => {
//   try {
//     const { amount, currency } = req.body;

//    const options = {
//   amount: amount * 100, // paisa
//   currency: 'INR',
//   receipt: `receipt_${Date.now()}`,
// };

//     const order = await razorpay.orders.create(options);

//     res.status(200).json({
//       success: true,
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// export const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       tourId,
//       price,
//       participants,
//       startDate,
//     } = req.body;

//     const userId = req.user.id;

//     // Step 1: Verify Signature
//     const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//     const expectedSignature = hmac.digest('hex');

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: 'Invalid signature' });
//     }

//     // Step 2: Create Booking
//     const booking = await Booking.create({
//       user: userId,
//       tour: tourId,
//       participants,
//       startDate,
//       price,
//     });

//     // Step 3: Save Payment
//     const payment = await Payment.create({
//       user: userId,
//       booking: booking._id,
//       amount: price,
//       currency: 'INR',
//       paymentMethod: 'card',
//       transactionId: razorpay_payment_id,
//       provider: 'razorpay',
//       paymentStatus: 'completed',
//     });

//     return res.status(200).json({ success: true, booking, payment });
//   } catch (err) {
//     console.error('Payment verification error:', err);
//     res.status(500).json({ success: false, message: 'Server error during payment verification' });
//   }
// };

// // Get All Payments
// export const getAllPayments = async (req, res) => {
//   try {
//     const payments = await Payment.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: payments });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get Payments by User
// export const getPaymentsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });

//     if (!payments || payments.length === 0) {
//       return res.status(404).json({ success: false, message: 'No payments found for this user' });
//     }

//     res.status(200).json({ success: true, data: payments });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get Payment by ID

// export const getPaymentById = async (req, res) => {
//   try {
//     const { paymentId } = req.params;

//     // Check if the paymentId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(paymentId)) {
//       return res.status(400).json({ success: false, message: 'Invalid payment ID' });
//     }

//     const payment = await Payment.findById(paymentId);

//     if (!payment) {
//       return res.status(404).json({ success: false, message: 'Payment not found' });
//     }

//     res.status(200).json({ success: true, data: payment });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




// // Delete Payment (Admin Only)
// export const deletePayment = async (req, res) => {
//   try {
//     const { paymentId } = req.params;

//     const payment = await Payment.findByIdAndDelete(paymentId);

//     if (!payment) {
//       return res.status(404).json({ success: false, message: 'Payment not found' });
//     }

//     res.status(200).json({ success: true, message: 'Payment deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
