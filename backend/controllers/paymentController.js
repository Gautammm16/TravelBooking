import razorpay from '../utils/razorpay.js';
import Payment from '../models/Payment.js';
import crypto from 'crypto';

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // in paisa
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user,
      booking,
      amount,
      currency,
      paymentMethod,
    } = req.body;

    // Generate expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Save payment record
    const payment = await Payment.create({
      user,
      booking,
      amount,
      currency,
      paymentMethod,
      transactionId: razorpay_payment_id,
      provider: 'razorpay',
      paymentStatus: 'completed',
    });

    res.status(200).json({ success: true, message: 'Payment verified', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Payments by User
export const getPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ success: false, message: 'No payments found for this user' });
    }

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Payment by ID

export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Check if the paymentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Delete Payment (Admin Only)
export const deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
